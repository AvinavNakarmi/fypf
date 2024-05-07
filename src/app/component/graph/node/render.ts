import { ClassicPreset as Classic } from 'rete';
import { TextureService } from 'src/app/services/texture/texture.service';
export class Render extends Classic.Node {

    constructor(socket:Classic.Socket) {
        super('render');
        const metalicnessControl = new Classic.InputControl("number", {
            initial: 0,
            change(value) {

                console.log(value);
            },
          });
          const roughnessControl = new Classic.InputControl("number", {
            initial: 0,
            change(value) {
                console.log(value);
            },
          });
          const IORControl = new Classic.InputControl("number", {
            initial: 0,
            change(value) {
                console.log(value);
            },
          });
        
          this.addControl("input", metalicnessControl);
          this.addControl("input2", roughnessControl);
          this.addControl("input3", IORControl);

        }

}
