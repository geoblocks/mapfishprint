import VectorTileLayer from 'ol/layer/VectorTile.js';
import { Extent } from 'ol/extent.js';
import { LitElement, TemplateResult } from 'lit';
export declare class DemoApp extends LitElement {
    static styles: import("lit").CSSResult[];
    private mapEl?;
    private map?;
    private mvtLayer?;
    private printExtentLayer?;
    private targetSizeInPdfPoints;
    private printScale;
    private dpi;
    private result0;
    private zoom;
    private currentDemo;
    private shouldDeclutter;
    private useImmediateApi;
    configureVTStyle(layer: VectorTileLayer, url: string, sourceId: string): Promise<void>;
    createMap(): void;
    /**
     * @param resolution some resolution, typically the display resolution
     * @param pixelRatio typically the device pixel ratio
     * @return size
     */
    getPrintExtentSizeForResolution(resolution: number, pixelRatio: number): number[];
    firstUpdated(): void;
    print(): Promise<void>;
    configureSimpleDemo(): void;
    configureMapboxDemo1(): void;
    configureMapboxDemo(styleURL: string, sourceId: string): Promise<void>;
    updateDemo(demo: string): void;
    formatExtent(e: Extent): string;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'demo-app': DemoApp;
    }
}
