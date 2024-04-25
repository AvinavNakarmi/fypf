import { ClassicPreset as Classic } from 'rete';

export default class PerlinNoiseNode extends Classic.Node {

  constructor() {
    super('noise');
    const socket = new Classic.Socket('socket'); 
  }
}
