/**
 * @const {number}
 */
export var PDF_POINTS_PER_INCH = 72;
/**
 * @const {number}
 * According to the "international yard" definition 1 inch is defined as exactly 2.54 cm.
 */
export var METERS_PER_INCH = 0.0254;
/**
 * @const {number}
 */
export var PDF_POINTS_PER_METER = PDF_POINTS_PER_INCH / METERS_PER_INCH;
/**
 * This depends on the print DPI.
 * At DPI=254 we have DPI / METERS_PER_INCH = 254 / 0.0254 = 10^4
 */
export var PIXELS_PER_METER = 10000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUV0Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDO0FBRXRDOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0FBRTFFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyJ9