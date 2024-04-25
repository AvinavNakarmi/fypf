import { ClassicPreset as Classic } from 'rete';

export default class NoiseTextureNode extends Classic.Node {
  value = 1;

  constructor() {
    super('noise');
    const socket = new Classic.Socket('socket');
    
    
    this.addOutput('output', new Classic.Output(socket, 'Output'));

    this.addControl(
        'value',
        new Classic.InputControl("number", { 
        
        }));
  }
  getInput() {}


 
  
}
