import { PolymerElement } from '@polymer/polymer/polymer-element';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { enqueueDebouncer } from '@polymer/polymer/lib/utils/flush';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { html } from '@polymer/polymer/lib/utils/html-tag';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';

import { VIEW_INFO_INSTANCES, SHARED_VIEW_INFO } from './cosmoz-viewinfo-mixin';

export { viewInfoAware } from './cosmoz-viewinfo-mixin';

/**
 * `<cosmoz-viewinfo>` is a component to create a view with information about
 * available size and throttled resize events
 *
 * @polymer
 * @group Cosmoz Elements
 * @demo demo/index.html Demo
 * @demo demo/basic.html Basic Demo
 * @customElement
 */
export class CosmozViewInfo extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
	static get template() {
		return html`
			<slot></slot>
		`;
	}

	/**
	 * Get component name.
	 *
	 * @returns {string} Name.
	 */
	static get is() {
		return 'cosmoz-viewinfo';
	}

	/**
	 * Get component properties.
	 *
	 * @returns {object} Properties.
	 */
	static get properties() {
		return {
			/**
			 * Level of effects to use (0-10). Not in use.
			 */
			effects: {
				type: Number,
				value: 10,
				observer: '_effectsChanged'
			},
			/**
			 * Width breakpoint for mobile.
			 * https://www.google.com/design/spec/layout/adaptive-ui.html#adaptive-ui-breakpoints
			 */
			mobileBreakpoint: {
				type: Number,
				value: 600
			},
			/**
			 * Width breakpoint for tablet.
			 * https://www.google.com/design/spec/layout/adaptive-ui.html#adaptive-ui-breakpoints
			 */
			tabletBreakpoint: {
				type: Number,
				value: 960
			},
			/**
			 * Minimum delay between each viewinfo-resize event (ms).
			 */
			throttleTimeout: {
				type: Number,
				value: 250
			}
		};
	}

	constructor() {
		super();
		this._boundOnResize = this._onResize.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('iron-resize', this._boundOnResize);
		this._updateViewSize();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('iron-resize', this._boundOnResize);
		if (this._debouncer) {
			this._debouncer.cancel();
		}
	}

	/**
	 * Notify instances of effect changes.
	 *
	 * @param {object} newValue Changed effects.
	 * @returns {void}
	 */
	_effectsChanged(newValue) {
		this._notifyInstances({ effects: newValue });
	}

	/**
	 * Loops over registered ViewInfoBehavior components and notify of
	 * changes.
	 * TODO: Don't reset the viewInfo property, but rather notify specific
	 * properties.
	 *
	 * @param  {object} delta object with changes
	 * @returns {void}
	 */
	_notifyInstances(delta) {
		VIEW_INFO_INSTANCES.forEach(instance => {
			if (!instance) {
				return;
			}
			Object.keys(delta).forEach(key => {
				instance.notifyPath('viewInfo.' + key, delta[key]);
			});
		});
	}

	/**
	 * Called on `iron-resize`, throttles `viewinfo-resize` events.
	 * @returns {void}
	 */
	_onResize() {
		if (!Array.isArray(VIEW_INFO_INSTANCES) || VIEW_INFO_INSTANCES.length === 0) {
			return;
		}
		enqueueDebouncer(
			this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(this.throttleTimeout), () => {
				const update = this._updateViewSize();

				VIEW_INFO_INSTANCES.filter(el => {
					// Only dispatch event on visible elements, offsetParent should be null for hidden
					// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
					return el.offsetParent !== null;
				}).forEach(element => {
					element.dispatchEvent(
						new CustomEvent('viewinfo-resize', {
							bubbles: true,
							composed: true,
							detail: {
								bigger: update
							}
						})
					);
				});
			})
		);
	}

	/**
	 * Recalculates viewInfo and updated SHARED_VIEW_INFO accordingly.
	 *
	 * @returns {boolean}  returns true if SHARED_VIEW_INFO.width is lower the
	 * next width
	 */
	_updateViewSize() {
		const prevWidth = SHARED_VIEW_INFO.width,
			next = {
				height: this.clientHeight || this.offsetHeight || this.scrollHeight,
				width: this.clientWidth || this.offsetWidth || this.scrollWidth
			};

		next.portrait = next.height > next.width;
		next.landscape = !next.portrait;

		if (next.width <= this.mobileBreakpoint) {
			next.mobile = true;
			next.tablet = false;
		} else if (next.width <= this.tabletBreakpoint) {
			next.mobile = false;
			next.tablet = true;
		} else {
			next.mobile = false;
			next.tablet = false;
		}

		next.desktop = !next.mobile && !next.tablet;

		const delta = this._getDelta(SHARED_VIEW_INFO, next);

		Object.keys(delta).forEach(key => {
			SHARED_VIEW_INFO[key] = delta[key];
		});

		this._notifyInstances(delta);

		return prevWidth < next.width;
	}

	/**
	 * Calculates the diff between two objects.
	 *
	 * @param  {object} prev First object.
	 * @param  {object} next Second object.
	 * @returns {object} Delta.
	 */
	_getDelta(prev, next) {
		return Object.keys(next).reduce((delta, key) => {
			const nextVal = next[key];
			if (prev[key] === undefined || prev[key] !== nextVal) {
				delta[key] = nextVal;
			}
			return delta;
		}, {});
	}
}

customElements.define(CosmozViewInfo.is, CosmozViewInfo);
