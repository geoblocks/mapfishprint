/**
 * Center the print extent (in pixels) inside the viewport
 * @param dimensions size in pixels of the print extent
 * @param viewportWidth the width in pixels of the map displayed in the browser
 * @param viewportHeight the height in pixels of the map displayed in the browser
 * @return position of the centered print rectangle
 */
export function centerPrintExtent(dimensions, viewportWidth, viewportHeight) {
    var centerX = viewportWidth / 2;
    var centerY = viewportHeight / 2;
    var printWidthInPixels = dimensions[0], printHeightInPixels = dimensions[1];
    var minX = centerX - printWidthInPixels / 2;
    var minY = centerY - printHeightInPixels / 2;
    return [minX, minY, minX + printWidthInPixels, minY + printHeightInPixels];
}
export function drawPrintExtent(event, dimensions) {
    var viewport = event.target.getViewport();
    var canvases = viewport.getElementsByTagName('canvas');
    var frameState = event.frameState;
    var viewportWidth = Number((frameState.size[0] * frameState.pixelRatio).toFixed());
    var viewportHeight = Number((frameState.size[1] * frameState.pixelRatio).toFixed());
    var printPosition = centerPrintExtent(dimensions, viewportWidth, viewportHeight);
    for (var i = canvases.length - 1; i >= 0; i--) {
        // layer creates new canvas on high resolution devices
        var canvas = canvases.item(i);
        var context = canvas.getContext('2d');
        if (canvas.width === viewportWidth && canvas.height === viewportHeight) {
            // checks for correct canvas
            context.beginPath();
            // outer rectangle
            context.rect(0, 0, viewportWidth, viewportHeight);
            // inner rectangle
            context.rect(printPosition[0], printPosition[1], dimensions[0], dimensions[1]);
            context.fillStyle = 'rgba(0, 5, 25, 0.15)';
            context.fill('evenodd');
            break; // extent should be added only for a newest canvas
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdGNvbXBvc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9zdGNvbXBvc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUE7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixVQUFvQixFQUNwQixhQUFxQixFQUNyQixjQUFzQjtJQUV0QixJQUFNLE9BQU8sR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLElBQU0sT0FBTyxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFNUIsSUFBQSxrQkFBa0IsR0FBeUIsVUFBVSxHQUFuQyxFQUFFLG1CQUFtQixHQUFJLFVBQVUsR0FBZCxDQUFlO0lBQzdELElBQU0sSUFBSSxHQUFHLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDOUMsSUFBTSxJQUFJLEdBQUcsT0FBTyxHQUFHLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxHQUFHLG1CQUFtQixDQUFDLENBQUM7QUFDN0UsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQzdCLEtBQWtCLEVBQ2xCLFVBQW9CO0lBRXBCLElBQU0sUUFBUSxHQUFJLEtBQUssQ0FBQyxNQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckQsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXpELElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFXLENBQUM7SUFDckMsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUMxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUN2RCxDQUFDO0lBQ0YsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUMzQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUN2RCxDQUFDO0lBRUYsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQ3JDLFVBQVUsRUFDVixhQUFhLEVBQ2IsY0FBYyxDQUNmLENBQUM7SUFFRixLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM5QyxzREFBc0Q7UUFDdEQsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQztRQUNqQyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRSxDQUFDO1FBRXpDLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxhQUFhLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxjQUFjLEVBQUUsQ0FBQztZQUN2RSw0QkFBNEI7WUFDNUIsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRXBCLGtCQUFrQjtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRWxELGtCQUFrQjtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUNWLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFDaEIsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUNoQixVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQ2IsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUNkLENBQUM7WUFFRixPQUFPLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO1lBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLGtEQUFrRDtRQUMzRCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMifQ==