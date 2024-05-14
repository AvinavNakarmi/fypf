import { Component, Input } from '@angular/core';
import { ControlModel } from 'src/app/model/control.model';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class NodeComponent {
@Input() title= "title";
@Input() controls!:ControlModel[];

}
