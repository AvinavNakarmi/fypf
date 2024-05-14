import { Injectable, Injector } from '@angular/core';
import { ClassicPreset, GetSchemes, NodeEditor } from 'rete';
import { AngularArea2D, AngularPlugin } from 'rete-angular-plugin';
import { AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin } from 'rete-connection-plugin';
import { ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets, } from 'rete-context-menu-plugin';
import { DataflowEngine, DataflowEngineScheme } from 'rete-engine';
import { Socket } from 'rete/_types/presets/classic';
import { ClassicPreset as Classic } from 'rete';

@Injectable({
  providedIn: 'root'
})

export class NodeService extends Classic.Node{
  socket!:Socket; 
  
  constructor() {
    super("");

 }

  setSocket(socket:Socket)
  {
    this.socket= socket;

  }
   
}
                                                                                           