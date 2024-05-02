import { Injector } from '@angular/core';
import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import { AngularPlugin, Presets, AngularArea2D } from 'rete-angular-plugin/15';
import { Render } from './node/render';
import {
  ContextMenuExtra,
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from 'rete-context-menu-plugin';
import { Perlin } from './node/texture/noise';
import { Add, Divide, Multiply, Subtract } from './node/arithmetic';
import { DataflowEngine, DataflowEngineScheme } from "rete-engine";
import { NumberNode } from './node/input';

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = AngularArea2D<Schemes> | ContextMenuExtra;

export async function createEditor(container: HTMLElement, injector: Injector) {
  const socket = new ClassicPreset.Socket('socket');

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new AngularPlugin<Schemes, AreaExtra>({ injector });
  const engine = new DataflowEngine<DataflowEngineScheme>();

  function process() {
    
    engine.reset();

    editor
      .getNodes()
      .filter((n) => n instanceof  ClassicPreset.Node)
      .forEach((n) => engine.fetch( n.id));
  }
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['renderer', () => new Render(socket)],
      [
        'Input',
        [
          ['Number', () => new NumberNode(socket,process)],
          ['Value Noise', () => new Perlin(socket)],
          ['Billow Noise', () => new Perlin(socket)],
          ['Ridged Noise', () => new Perlin(socket)],
          ['Voronoi Noise', () => new Perlin(socket)],
        ],
      ],
      [
        'Texture',
        [
          ['Perlin Noise', () => new Perlin(socket)],
          ['Value Noise', () => new Perlin(socket)],
          ['Billow Noise', () => new Perlin(socket)],
          ['Ridged Noise', () => new Perlin(socket)],
          ['Voronoi Noise', () => new Perlin(socket)],
        ],
      ],
      ['Arithmetic',
            [
              ['Add', () => new Add(socket,process, (c) => area.update("control", c.id))],
              ['Subtract', () => new Subtract(socket)],
              ['Multiply', () => new Multiply(socket)],
              ['Divide', () => new Divide(socket)],
            ],
          ],
          ['Trigonometric',
          [
            ['sin', () => new Perlin(socket)],
            ['cos', () => new Perlin(socket)],
            ['tan', () => new Perlin(socket)],
            ['asin', () => new Perlin(socket)],
            ['acos', () => new Perlin(socket)],
            ['atan', () => new Perlin(socket)],
          ],
        ],
         
        [
          'Exponential and Logarithmic',
          [
            ['Exponent', () => new Perlin(socket)],
            ['Logarithm', () => new Perlin(socket)],
          ],
        ],
        [
          'Power',
          [
            ['Power', () => new Perlin(socket)],
            ['Square Root', () => new Perlin(socket)],
            ['Inverse Square Root', () => new Perlin(socket)],
          ],
        ],
          
        [
          'Integer',
          [
            ['Absolute', () => new Perlin(socket)],
            ['Floor', () => new Perlin(socket)],
            ['Round', () => new Perlin(socket)],
            ['Ceil', () => new Perlin(socket)],
            ['Round', () => new Perlin(socket)],
          ],
        ],
        
        [
          'Clamping',
          [
            ['Min', () => new Perlin(socket)],
            ['Max', () => new Perlin(socket)],
            ['Clamp', () => new Perlin(socket)],
          ],
        ],
        
        ['Mix', () => new Perlin(socket)],
   
      [
        'vector Math',
        [
          ['Perlin Noise', () => new Perlin(socket)],
          ['Value Noise', () => new Perlin(socket)],
          ['Billow Noise', () => new Perlin(socket)],
          ['Ridged Noise', () => new Perlin(socket)],
          ['Voronoi Noise', () => new Perlin(socket)],
        ],
      ],

      [
        'Color Math',
        [
          ['Perlin Noise', () => new Perlin(socket)],
          ['Value Noise', () => new Perlin(socket)],
          ['Billow Noise', () => new Perlin(socket)],
          ['Ridged Noise', () => new Perlin(socket)],
          ['Voronoi Noise', () => new Perlin(socket)],
        ],
      ],
    ]),
  });
  area.use(contextMenu);
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.contextMenu.setup());
  render.addPreset(Presets.classic.setup());

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  const renderNode = new Render(socket);
  await editor.addNode(renderNode);



  AreaExtensions.zoomAt(area, editor.getNodes());

  return () => area.destroy();
}
