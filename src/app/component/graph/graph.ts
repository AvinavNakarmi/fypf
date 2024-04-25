import { Component, ElementRef, Injectable, Injector, OnDestroy, OnInit } from '@angular/core';
import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { AngularPlugin, Presets, AngularArea2D } from 'rete-angular-plugin';
import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
import { ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin';

type Node = NodeA | NodeB;
type Schemes = GetSchemes<Node, Connection<Node, Node>>;
type AreaExtra = AngularArea2D<Schemes> | ContextMenuExtra;

class NodeA extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor(socket: ClassicPreset.Socket) {
    super('NodeA');

    this.addControl('a', new ClassicPreset.InputControl('text', {}));
    this.addOutput('a', new ClassicPreset.Output(socket));
  }
}

class NodeB extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor(socket: ClassicPreset.Socket) {
    super('NodeB');

    this.addControl('b', new ClassicPreset.InputControl('text', {}));
    this.addInput('b', new ClassicPreset.Input(socket));
  }
}

class Connection<A extends Node, B extends Node> extends ClassicPreset.Connection<A, B> {}



@Injectable({
  providedIn: 'root'
})
export class GraphService {
 
  private editor: NodeEditor<Schemes> | null = null;
  private area: AreaPlugin<Schemes, AreaExtra> | null = null;

  constructor( ) { }
  async createEditor(elementRef: any,injector:Injector) {

    const socket = new ClassicPreset.Socket('socket');

    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(elementRef);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new AngularPlugin<Schemes, AreaExtra>({ injector });
    const contextMenu = new ContextMenuPlugin<Schemes>({
      items: ContextMenuPresets.classic.setup([
        ['NodeA', () => new NodeA(socket)],
        ['Extra', [['NodeB', () => new NodeB(socket)]]]
      ])
    });

    this.area.use(contextMenu);

    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl()
    });

    render.addPreset(Presets.contextMenu.setup());
    render.addPreset(Presets.classic.setup());



    this.editor.use(this.area);
    this.area.use(connection);
    this.area.use(render);


    const a = new NodeA(socket);
    const b = new NodeB(socket);

    this.editor.addNode(a);
     this.editor.addNode(b);

    this.editor.addConnection(new ClassicPreset.Connection(a, 'a', b, 'b'));

  }

  ngOnDestroy() {
    if (this.area) {
      this.area.destroy();
    }
  }
}


