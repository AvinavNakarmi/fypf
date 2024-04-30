import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { createEditor } from 'src/app/graph/graph';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
@ViewChild("rete") container!:ElementRef<HTMLElement>;

constructor(private injector:Injector)
{
  
}

async ngAfterViewInit() {
  await createEditor(this.container.nativeElement, this.injector)
}
}
