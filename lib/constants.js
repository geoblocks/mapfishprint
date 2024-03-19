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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUc7SUFDdkIsa0hBQWtIO0lBQ2xILGVBQWUsRUFBRSxPQUFPO0lBQ3hCLG1CQUFtQjtJQUNuQixhQUFhLEVBQUUsRUFBRTtJQUNqQiw2RkFBNkY7SUFDN0YsZUFBZSxFQUFFLE1BQU07Q0FDeEIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHO0lBQ2pDLHVDQUF1QztJQUN2QyxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxlQUFlO0NBQ2pGLENBQUMifQ==