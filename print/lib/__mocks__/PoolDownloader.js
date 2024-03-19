import fetch from 'node-fetch';
// @ts-ignore
global.fetch = fetch;
import fs from 'fs';
export function mockFetch(input, init) {
    if (typeof input === 'string' && input.startsWith('/tiles/')) {
        var fileName = "public".concat(input);
        return fs.promises.readFile(fileName).then(function (b) {
            return ({
                arrayBuffer: function () {
                    return b;
                },
            });
        });
    }
    // @ts-ignore
    return fetch(input, init);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbERvd25sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvX19tb2Nrc19fL1Bvb2xEb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLFlBQVksQ0FBQztBQUMvQixhQUFhO0FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDckIsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXBCLE1BQU0sVUFBVSxTQUFTLENBQ3ZCLEtBQWtCLEVBQ2xCLElBQWtCO0lBRWxCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUM3RCxJQUFNLFFBQVEsR0FBRyxnQkFBUyxLQUFLLENBQUUsQ0FBQztRQUNsQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FDeEMsVUFBQyxDQUFDO1lBQ0EsT0FBQSxDQUFDO2dCQUNDLFdBQVc7b0JBQ1QsT0FBTyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQzthQUNzQixDQUFBO1FBSnpCLENBSXlCLENBQzVCLENBQUM7SUFDSixDQUFDO0lBQ0QsYUFBYTtJQUNiLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDIn0=