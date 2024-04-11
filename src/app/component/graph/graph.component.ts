import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
} from '@angular/core';

import { createEditor } from './editor';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements AfterViewInit{
  constructor(private injector: Injector) {}

  @ViewChild('rete') container!: ElementRef;

  ngAfterViewInit(): void {
    const el = this.container.nativeElement;

    if (el) {
      createEditor(el, this.injector);
    }
  }
}
