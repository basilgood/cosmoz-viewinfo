cosmoz-viewinfo
=================

[![Build Status](https://github.com/Neovici/cosmoz-viewinfo/workflows/Github%20CI/badge.svg)](https://github.com/Neovici/cosmoz-viewinfo/actions?workflow=Github+CI)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/Neovici/cosmoz-viewinfo)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## &lt;cosmoz-viewinfo&gt;

**cosmoz-viewinfo** is a component to create a view with information about
available size and throttled resize events.

Example:

<!---
```
<custom-element-demo>
	<template>
		<script src="../webcomponentsjs/webcomponents-lite.js"></script>
		<link rel="import" href="cosmoz-viewinfo.html">
		<style>
			cosmoz-viewinfo {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
		</style>
		<next-code-block></next-code-block>
	</template>
</custom-element-demo>
```
-->
```html
<dom-bind id="template">
	<template is="dom-bind">
		<cosmoz-viewinfo>
		</cosmoz-viewinfo>
	</template>
</dom-bind>
```