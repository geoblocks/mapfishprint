export const Constants = {
  /** "Standardized rendering pixel size" is defined as 0.28 mm, see http://www.opengeospatial.org/standards/wmts */
  WMTS_PIXEL_SIZE: 0.28e-3,
  /** Standard DPI */
  DOTS_PER_INCH: 72,
  /** According to the "international yard" definition 1 inch is defined as exactly 2.54 cm. */
  METERS_PER_INCH: 0.0254,
};

export const CalculatedConstants = {
  /** Default to DPI / METERS per Inch */
  DPI_PER_DISTANCE_UNIT: () => Constants.DOTS_PER_INCH / Constants.METERS_PER_INCH,
};
