import { create as createTransform, compose as composeTransform } from 'ol/transform.js';
import { getCenter as getExtentCenter } from 'ol/extent.js';
import { transform2D } from 'ol/geom/flat/transform.js';
/**
 * A low level utility
 * @param features
 * @param styleFunction
 * @param resolution
 * @param coordinateToPixelTransform
 * @param vectorContext
 * @param additionalDraw
 * @return
 */
export function drawFeaturesToContext(features, styleFunction, resolution, coordinateToPixelTransform, vectorContext, additionalDraw) {
    if (!styleFunction) {
        return;
    }
    features.forEach((f) => {
        const optGeometry = f.getGeometry();
        if (!optGeometry) {
            return;
        }
        const geometry = optGeometry.clone();
        geometry.applyTransform((flatCoordinates, dest, stride) => {
            return transform2D(flatCoordinates, 0, flatCoordinates.length, stride || 2, coordinateToPixelTransform, dest);
        });
        const styles = styleFunction(f, resolution);
        if (styles) {
            if (Array.isArray(styles)) {
                styles.forEach((style) => {
                    vectorContext.setStyle(style);
                    vectorContext.drawGeometry(geometry);
                });
            }
            else {
                vectorContext.setStyle(styles);
                vectorContext.drawGeometry(geometry);
            }
            additionalDraw(geometry);
        }
    });
}
/**
 * A low level utility
 * @param printExtent
 * @param resolution
 * @param size
 * @return the transform
 */
export function createCoordinateToPixelTransform(printExtent, resolution, size) {
    const coordinateToPixelTransform = createTransform();
    const center = getExtentCenter(printExtent);
    // See VectorImageLayer
    // this.coordinateToVectorPixelTransform_ = compose(this.coordinateToVectorPixelTransform_,
    composeTransform(coordinateToPixelTransform, size[0] / 2, size[1] / 2, 1 / resolution, -1 / resolution, 0, -center[0], -center[1]);
    return coordinateToPixelTransform;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXZ0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXZ0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFDLE1BQU0sSUFBSSxlQUFlLEVBQUUsT0FBTyxJQUFJLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLFNBQVMsSUFBSSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFNMUQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBSXREOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsUUFBbUIsRUFDbkIsYUFBd0MsRUFDeEMsVUFBa0IsRUFDbEIsMEJBQXFDLEVBQ3JDLGFBQTRCLEVBQzVCLGNBQTRDO0lBRTVDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQixPQUFPO0lBQ1QsQ0FBQztJQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNyQixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLE9BQU87UUFDVCxDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3hELE9BQU8sV0FBVyxDQUNoQixlQUFlLEVBQ2YsQ0FBQyxFQUNELGVBQWUsQ0FBQyxNQUFNLEVBQ3RCLE1BQU0sSUFBSSxDQUFDLEVBQ1gsMEJBQTBCLEVBQzFCLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUN2QixhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QixhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDTixhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxnQ0FBZ0MsQ0FDOUMsV0FBbUIsRUFDbkIsVUFBa0IsRUFDbEIsSUFBYztJQUVkLE1BQU0sMEJBQTBCLEdBQUcsZUFBZSxFQUFFLENBQUM7SUFDckQsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLHVCQUF1QjtJQUN2QiwyRkFBMkY7SUFDM0YsZ0JBQWdCLENBQ2QsMEJBQTBCLEVBQzFCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ1gsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDWCxDQUFDLEdBQUcsVUFBVSxFQUNkLENBQUMsQ0FBQyxHQUFHLFVBQVUsRUFDZixDQUFDLEVBQ0QsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ1gsQ0FBQztJQUNGLE9BQU8sMEJBQTBCLENBQUM7QUFDcEMsQ0FBQyJ9