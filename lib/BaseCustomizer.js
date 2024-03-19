/**
 * The customizer allows to customize some transformations.
 * It also defines the print extent.
 */
export default class BaseCustomizer {
    printExtent;
    constructor(printExtent) {
        this.setPrintExtent(printExtent || [0, 0, Infinity, Infinity]);
    }
    getPrintExtent() {
        return this.printExtent;
    }
    setPrintExtent(printExtent) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUN1c3RvbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQmFzZUN1c3RvbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0E7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQ3pCLFdBQVcsQ0FBVztJQUU5QixZQUFZLFdBQXNCO1FBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQsY0FBYyxDQUFDLFdBQXFCO1FBQ2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLFVBQWlCO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsY0FBYyxDQUFDLFFBQWtCO1FBQy9CLDZEQUE2RDtRQUM3RCxVQUFVO1FBQ1Ysa0VBQWtFO1FBQ2xFLGlEQUFpRDtRQUNqRCx5QkFBeUI7UUFDekIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxVQUFpQixFQUFFLE9BQXVCLElBQUcsQ0FBQztJQUV0RDs7Ozs7T0FLRztJQUNILElBQUksQ0FBQyxVQUFpQixFQUFFLFVBQTZCLEVBQUUsTUFBYyxJQUFHLENBQUM7SUFFekU7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsVUFBaUIsRUFBRSxVQUE4QixFQUFFLEtBQVksSUFBRyxDQUFDO0lBRXpFOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLFVBQWlCLEVBQUUsU0FBdUIsRUFBRSxNQUFZLElBQUcsQ0FBQztDQUd2RSJ9