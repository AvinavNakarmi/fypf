import { Component, ElementRef, Injector, ViewChild } from "@angular/core";
import { createEditor } from "./editor";


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
  constructor(private injector: Injector) {}
  
  @ViewChild("rete") container!: ElementRef;

  async ngAfterViewInit() {
    await createEditor(this.container.nativeElement, this.injector)

  }
 

}
