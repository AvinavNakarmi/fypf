import { Injector } from "@angular/core";
import { ClassicPreset, GetSchemes, NodeEditor } from "rete";

import {AngularArea2D, Presets,AngularPlugin  } from "rete-angular-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin"
import { AreaExtensions } from "rete-area-plugin";


type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
export async function createEditor(container: HTMLElement, injector: Injector) {
 
const editor = new NodeEditor<Schemes>();
const socket = new ClassicPreset.Socket("socket");

const nodeA = new ClassicPreset.Node("A");
nodeA.addControl("a", new ClassicPreset.InputControl("text", {}));
nodeA.addOutput("a", new ClassicPreset.Output(socket));
await editor.addNode(nodeA);

type AreaExtra = AngularArea2D<Schemes>;

const area = new AngularPlugin<Schemes, AreaExtra>({injector,container});
const render = new AngularPlugin<Schemes, AreaExtra>({ injector });

render.addPreset(Presets.classic.setup());
editor.use(area);
area.use(render);

const nodeB = new ClassicPreset.Node("B");
nodeB.addControl("b", new ClassicPreset.InputControl("text", {}));
nodeB.addInput("b", new ClassicPreset.Input(socket));
await editor.addConnection(new ClassicPreset.Connection(nodeA, "a", nodeB, "b"));
await editor.addNode(nodeB);

const connection = new ConnectionPlugin<Schemes, AreaExtra>();

connection.addPreset(ConnectionPresets.classic.setup())

area.use(connection);
AreaExtensions.zoomAt(area, editor.getNodes());
AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });
  AreaExtensions.simpleNodesOrder(area);
}


