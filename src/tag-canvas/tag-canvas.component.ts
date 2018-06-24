import { AfterViewInit, Component, DoCheck, Input, OnDestroy, ElementRef, ViewChild } from "@angular/core";
import { v4 as uuid } from 'uuid';
import { Tag } from "./tag";

@Component({
    selector: 'tag-canvas',
    templateUrl: 'tag-canvas.component.html',
    styleUrls: [ 'tag-canvas.component.css' ]
})
export class TagCanvasComponent implements AfterViewInit, DoCheck, OnDestroy {

    private readonly _instanceId = uuid();

    readonly canvasId = `canvas-${this._instanceId}`;
    readonly tagListId = `tags-${this._instanceId}`;

    readonly defaultOptions: TagCanvasOptions = {
        textFont: null,
        textColour: null
    };

    canvasWidth: number;
    canvasHeight: number;

    private _options: TagCanvasOptions;

    @Input()
    tags: Tag[];

    // TODO: Add stretch (boolean) input

    @Input()
    set options(value: TagCanvasOptions) {
        this._options = value;
        this.start();
    }

    get options() {
        return this._options;
    }

    @ViewChild('canvas')
    canvas: ElementRef;

    constructor(private elementRef: ElementRef) {

    }

    ngAfterViewInit(): void {
        let canvasElement = this.canvas.nativeElement as HTMLCanvasElement;
        canvasElement.width = Math.round(canvasElement.clientWidth);
        canvasElement.height = Math.round(canvasElement.clientHeight);

        let style = window.getComputedStyle(this.elementRef.nativeElement);
        this.defaultOptions.textHeight = parseFloat(style['font-size']);

        this.start();
    }
    
    async start() {
        let mergedOptions = Object.assign({}, this.defaultOptions, this._options);
        await blinkEyes();
        TagCanvas.Start(this.canvasId, this.tagListId, mergedOptions);
    }

    async update() {
        await blinkEyes();
        TagCanvas.Update(this.canvasId);
    }

    private _previousTagListState: string;

    ngDoCheck(): void {
        let tagListState = JSON.stringify(this.tags.map(({ text: text }) => ({ text: text }))); // TODO: Improve performance, use KeyValueDiffer/IterableDiffer
        if (this._previousTagListState !== tagListState) {
            this._previousTagListState = tagListState;
            this.update();
        }
    }

    ngOnDestroy(): void {
        TagCanvas.Delete(this.canvasId);
    }

}

async function blinkEyes() {
    // waits for change detection cycle
    await new Promise(resolve => setTimeout(() => resolve()));
}
