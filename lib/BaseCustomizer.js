export default class BaseCustomizer {
    printExtent;
    constructor(printExtent) {
        this.printExtent = printExtent;
    }
    layerFilter(layerState) {
        return true;
    }
    geometryFilter(geometry) {
        return true;
    }
    feature(layerState, feature) { }
    line(layerState, symbolizer, stroke) { }
    point(layerState, symbolizer, image) { }
    wmtsLayer(layerState, wmtsLayer, source) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUN1c3RvbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQmFzZUN1c3RvbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQ3hCLFdBQVcsQ0FBVztJQUUvQixZQUFZLFdBQXFCO1FBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxXQUFXLENBQUMsVUFBaUI7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWtCO1FBQy9CLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE9BQU8sQ0FBQyxVQUFpQixFQUFFLE9BQXdCLElBQUcsQ0FBQztJQUV2RCxJQUFJLENBQ0YsVUFBaUIsRUFDakIsVUFBc0MsRUFDdEMsTUFBYyxJQUNiLENBQUM7SUFFSixLQUFLLENBQ0gsVUFBaUIsRUFDakIsVUFBdUMsRUFDdkMsS0FBWSxJQUNYLENBQUM7SUFFSixTQUFTLENBQ1AsVUFBaUIsRUFDakIsU0FBZ0MsRUFDaEMsTUFBWSxJQUNYLENBQUM7Q0FDTCJ9