import {NgModule,Directive,ElementRef,HostListener,Input,Output,DoCheck,EventEmitter,Optional} from '@angular/core';
import {NgModel} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Directive({
    selector: '[pInputTextarea]',
    host: {
        '[class.ui-inputtext]': 'true',
        '[class.ui-corner-all]': 'true',
        '[class.ui-inputtextarea-resizable]': 'autoResize',
        '[class.ui-state-default]': 'true',
        '[class.ui-widget]': 'true',
        '[class.ui-state-filled]': 'filled'
    }
})
export class InputTextarea implements DoCheck {

    @Input() autoResize: boolean;

    @Output() onResize: EventEmitter<any> = new EventEmitter();

    filled: boolean;

    cachedScrollHeight:number;

    mutationObserver: MutationObserver;

    constructor(public el: ElementRef, @Optional() public ngModel: NgModel) {
        this.mutationObserver = new MutationObserver(() => this.elementMutated());
        this.listenMutations();
    }

    listenMutations() {
        this.mutationObserver.observe(this.el.nativeElement, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
    }

    elementMutated() {
        this.updateFilledState();

        if (this.autoResize) {
            this.mutationObserver.disconnect();
            this.resize();
            this.listenMutations();
        }
    }

    ngDoCheck() {
        this.updateFilledState();

        if (this.autoResize) {
            this.resize();
        }
    }

    //To trigger change detection to manage ui-state-filled for material labels when there is no value binding
    @HostListener('input', ['$event'])
    onInput(e) {
        this.updateFilledState();
        if (this.autoResize) {
            this.resize(e);
        }
    }

    updateFilledState() {
        this.filled = (this.el.nativeElement.value && this.el.nativeElement.value.length) || (this.ngModel && this.ngModel.model);
    }

    @HostListener('focus', ['$event'])
    onFocus(e) {
        if (this.autoResize) {
            this.resize(e);
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(e) {
        if (this.autoResize) {
            this.resize(e);
        }
    }

    resize(event?: Event) {
        this.el.nativeElement.style.height = '0';

        let computedHeight = this.el.nativeElement.scrollHeight;
        const boxSizing = getComputedStyle(this.el.nativeElement).boxSizing;

        if (boxSizing === 'content-box') {
            computedHeight = computedHeight -
                parseInt(getComputedStyle(this.el.nativeElement).paddingTop, 10) -
                parseInt(getComputedStyle(this.el.nativeElement).paddingBottom, 10);
        }

        this.el.nativeElement.style.height = computedHeight + 'px';

        if (parseFloat(this.el.nativeElement.style.height) >= parseFloat(this.el.nativeElement.style.maxHeight)) {
            this.el.nativeElement.style.overflowY = "scroll";
            this.el.nativeElement.style.height = this.el.nativeElement.style.maxHeight;
        }
        else {
            this.el.nativeElement.style.overflow = "hidden";
        }

        this.onResize.emit(event||{});
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [InputTextarea],
    declarations: [InputTextarea]
})
export class InputTextareaModule { }
