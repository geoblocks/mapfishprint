/**
 * Simple proxy to the fetch function for now.
 * Can be updated later to limit the number of concurrent requests.
 * Can be made to work on stub for testing.
 */
var PoolDownloaderr = /** @class */ (function () {
    function PoolDownloaderr() {
        this.fetcher =
            typeof fetch !== 'undefined'
                ? fetch.bind(window)
                : null;
    }
    PoolDownloaderr.prototype.fetch = function (input, init) {
        return this.fetcher(input, init);
    };
    return PoolDownloaderr;
}());
export { PoolDownloaderr };
export function toto() {
    console.log('coucou');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbERvd25sb2FkZXJyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Bvb2xEb3dubG9hZGVyci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBQ0g7SUFHRTtRQUNFLElBQUksQ0FBQyxPQUFPO1lBQ1YsT0FBTyxLQUFLLEtBQUssV0FBVztnQkFDMUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNwQixDQUFDLENBQUUsSUFBZ0MsQ0FBQztJQUMxQyxDQUFDO0lBRUQsK0JBQUssR0FBTCxVQUFNLEtBQWtCLEVBQUUsSUFBa0I7UUFDMUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBYkQsSUFhQzs7QUFFRCxNQUFNLFVBQVUsSUFBSTtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLENBQUMifQ==