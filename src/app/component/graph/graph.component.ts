import { Component, ElementRef, Injector, ViewChild } from '@angular/core';

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
}
}
