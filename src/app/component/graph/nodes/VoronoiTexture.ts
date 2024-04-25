import { ClassicPreset as Classic } from 'rete';

export default class VoronoiTextureNode extends Classic.Node {

  constructor() {
    super('noise');
    const socket = new Classic.Socket('socket'); 
  }
}
