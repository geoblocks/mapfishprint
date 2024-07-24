# @geoblocks/geoblocks changes

## 0.2.15

- Use ol getFontParameters to parse font.
- Fallback to fill color if none is specified on circle style.

Breaking changes:

- Pass feature object to allow informed customization.


## 0.2.14

- Fix (invert) text Y axis offset.

## 0.2.13

- Allow to customize vector text.

## 0.2.12

- Allow to customize WMS.

## 0.2.6

- Make it compatible with OpenLayers 9;
- Remove support of OpenLayers 6;
- Update @geoblocks/print.

## 0.2.5

- Fix not printed text on lines and polygons.

## 0.2.4
- Add a cancel function.
- Move createReport to utils.
- Add **raw** encode support for WMS and Tile WMS layers.

## 0.2.3
- Add utility functions.
- In `BaseCustomizer`, the printExtent can be now set and get/set are dedicated methods.
- `pdfA` (allow transparency) is now a spec.map optional param.
- spec.attributes are now partial and `datasource` attribute is removed.
- CreateSpecOptions accepts now every format.
- Add a timeout and manage errors on the `getDownloadUrl` utils function.

## v0.2.2
- Add optional MVTEncoder

## v0.2.0
- General refactor (rename classes / types)

## v0.1.2
- Add inline source maps.
- Publish a transpiled ES6 library + types.
