import { Component } from "@angular/core";
import { ControlModel } from "src/app/model/control.model";


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
title="render Node";
controls:ControlModel[]=[{
  isInput:true,
  name:"metalicness",
  dataType:"text",
  defaultValue:0.001
},
{
  isInput:true,
  name:"roughness",
  dataType:"text",
  defaultValue:0.001
},
{
  isInput:true,
  name:"IOR",
  dataType:"text",
  defaultValue:1.45
}]
}
