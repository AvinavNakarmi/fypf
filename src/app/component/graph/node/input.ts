import { ClassicPreset as Classic, ClassicPreset } from 'rete';
export class NumberNode extends Classic.Node {
  constructor(socket: Classic.Socket, change?: () => void) {
    super('add');
    const value = new ClassicPreset.InputControl('number', {
      initial:  0, change,
     
    });
    this.addControl('value', value);
    this.addOutput('value', new Classic.Output(socket, 'Number'));
  }
  
  data(): { value: number } {
    return {
      value:10
    };
  }
  
}
export class ColorNode extends Classic.Node {
  constructor(socket: Classic.Socket) {
    super('render');
    this.addInput(`metalicness`, new Classic.Input(socket, `metalicness`));
    this.addInput(`roughness`, new Classic.Input(socket, `roughness`));
    this.addInput(`IOR`, new Classic.Input(socket, `IOR`));
    this.addInput(`normal`, new Classic.Input(socket, `normal`));
  }
}
export class VectorNode extends Classic.Node {
  constructor(socket: Classic.Socket) {
    super('render');
    this.addInput(`metalicness`, new Classic.Input(socket, `metalicness`));
    this.addInput(`roughness`, new Classic.Input(socket, `roughness`));
    this.addInput(`IOR`, new Classic.Input(socket, `IOR`));
    this.addInput(`normal`, new Classic.Input(socket, `normal`));
  }
}
