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
            if (additionalDraw)
                additionalDraw(vectorContext, geometry);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXZ0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXZ0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFDLE1BQU0sSUFBSSxlQUFlLEVBQUUsT0FBTyxJQUFJLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLFNBQVMsSUFBSSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFNMUQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBSXREOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsUUFBbUIsRUFDbkIsYUFBd0MsRUFDeEMsVUFBa0IsRUFDbEIsMEJBQXFDLEVBQ3JDLGFBQTRCLEVBQzVCLGNBQWdFO0lBRWhFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQixPQUFPO0lBQ1QsQ0FBQztJQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNyQixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLE9BQU87UUFDVCxDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3hELE9BQU8sV0FBVyxDQUNoQixlQUFlLEVBQ2YsQ0FBQyxFQUNELGVBQWUsQ0FBQyxNQUFNLEVBQ3RCLE1BQU0sSUFBSSxDQUFDLEVBQ1gsMEJBQTBCLEVBQzFCLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUN2QixhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QixhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDTixhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxJQUFJLGNBQWM7Z0JBQUUsY0FBYyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5RCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdDQUFnQyxDQUM5QyxXQUFtQixFQUNuQixVQUFrQixFQUNsQixJQUFjO0lBRWQsTUFBTSwwQkFBMEIsR0FBRyxlQUFlLEVBQUUsQ0FBQztJQUNyRCxNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUMsdUJBQXVCO0lBQ3ZCLDJGQUEyRjtJQUMzRixnQkFBZ0IsQ0FDZCwwQkFBMEIsRUFDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDWCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNYLENBQUMsR0FBRyxVQUFVLEVBQ2QsQ0FBQyxDQUFDLEdBQUcsVUFBVSxFQUNmLENBQUMsRUFDRCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FDWCxDQUFDO0lBQ0YsT0FBTywwQkFBMEIsQ0FBQztBQUNwQyxDQUFDIn0=