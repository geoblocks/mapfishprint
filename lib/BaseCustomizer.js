/**
 * The customizer allows to customize some transformations.
 * It also defines the print extent.
 */
export default class BaseCustomizer {
    printExtent;
    /**
     *
     * @param printExtent The extent to print (useful for MVT / static image layers)
     */
    constructor(printExtent) {
        // FIXME: can not this be passed with the other options in createSpec?
        this.printExtent = printExtent;
    }
    /**
     *
     * @param layerState
     * @return true to convert this layer, false to skip it
     */
    layerFilter(layerState) {
        return true;
    }
    /**
     * Decide to skip some geometries.
     * Useful to avoid sending features outside the print extend on the wire.
     * @param geometry
     * @return true to convert this feature, false to skip it
     */
    geometryFilter(geometry) {
        // FIXME: shouldn't we provide some reasonable defaults here?
        // For ex:
        // - define a buffer of X pixels and remove all points outside it;
        // - only keep lines / polygons that intersect it
        // Cf schm for some code.
        return true;
    }
    /**
     * Can be used to add / remove properties to features
     * @param layerState
     * @param feature converted feature
     */
    feature(layerState, feature) { }
    /**
     * Can be used to manipulate the line symbolizers
     * @param layerState
     * @param symbolizer
     * @param stroke
     */
    line(layerState, symbolizer, stroke) { }
    /**
     * Can be used to manipulate the image symbolizers
     * @param layerState
     * @param symbolizer
     * @param image
     */
    point(layerState, symbolizer, image) { }
    /**
     * Can be used to manipulate a converted WMTS layer
     * @param layerState
     * @param wmtsLayer
     * @param source
     */
    wmtsLayer(layerState, wmtsLayer, source) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUN1c3RvbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQmFzZUN1c3RvbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0E7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQ3hCLFdBQVcsQ0FBVztJQUUvQjs7O09BR0c7SUFDSCxZQUFZLFdBQXFCO1FBQy9CLHNFQUFzRTtRQUN0RSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxVQUFpQjtRQUMzQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxRQUFrQjtRQUMvQiw2REFBNkQ7UUFDN0QsVUFBVTtRQUNWLGtFQUFrRTtRQUNsRSxpREFBaUQ7UUFDakQseUJBQXlCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsVUFBaUIsRUFBRSxPQUF1QixJQUFHLENBQUM7SUFFdEQ7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsVUFBaUIsRUFBRSxVQUE2QixFQUFFLE1BQWMsSUFBRyxDQUFDO0lBRXpFOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLFVBQWlCLEVBQUUsVUFBOEIsRUFBRSxLQUFZLElBQUcsQ0FBQztJQUV6RTs7Ozs7T0FLRztJQUNILFNBQVMsQ0FBQyxVQUFpQixFQUFFLFNBQXVCLEVBQUUsTUFBWSxJQUFHLENBQUM7Q0FHdkUifQ==