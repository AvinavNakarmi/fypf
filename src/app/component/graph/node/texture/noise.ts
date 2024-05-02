import { ClassicPreset as Classic } from 'rete';
export class Perlin extends Classic.Node {

    constructor(socket:Classic.Socket) {
        super('render');
        this.addInput(`metalicness`, new Classic.Input(socket, `metalicness`));
        this.addInput(`roughness`, new Classic.Input(socket, `roughness`));
        this.addInput(`IOR`, new Classic.Input(socket, `IOR`));
        this.addInput(`normal`, new Classic.Input(socket, `normal`));  
        }
}
