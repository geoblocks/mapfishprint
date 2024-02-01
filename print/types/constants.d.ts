/**
 * @const {number}
 */
export declare const PDF_POINTS_PER_INCH = 72;
/**
 * @const {number}
 * According to the "international yard" definition 1 inch is defined as exactly 2.54 cm.
 */
export declare const METERS_PER_INCH = 0.0254;
/**
 * @const {number}
 */
export declare const PDF_POINTS_PER_METER: number;
/**
 * This depends on the print DPI.
 * At DPI=254 we have DPI / METERS_PER_INCH = 254 / 0.0254 = 10^4
 */
export declare const PIXELS_PER_METER = 10000;
