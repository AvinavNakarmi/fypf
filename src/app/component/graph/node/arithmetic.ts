import { ClassicPreset as Classic, ClassicPreset } from 'rete';
export class Add extends Classic.Node {

    constructor(socket:Classic.Socket,
        change?: () => void,
        private update?: (control: ClassicPreset.InputControl<"number">) => void
  
    ) {
        super('Add');
        const output = new Classic.Output(socket);
           // Add input sockets for the numbers to be added
    const input1 = new Classic.Input(socket, 'value 1');
    const input2 = new Classic.Input(socket, 'value 2');
    input1.addControl(
        new ClassicPreset.InputControl("number", { initial: 0, change })
      );
      input2.addControl(
        new ClassicPreset.InputControl("number", { initial: 0, change })
      );
    this.addInput('number 1', input1);
    this.addInput('number 2', input2);
    const inputControl = new ClassicPreset.InputControl('number', {
        readonly:true
      });
      this.addOutput("value", new ClassicPreset.Output(socket, "Number"));


}
       
  
}

export class Subtract extends Classic.Node {

    constructor(socket:Classic.Socket) {
        super('Subtract');
        this .addOutput("subtract",new Classic.Output(socket,"subtract") );
        this.addInput(`number 1`, new Classic.Input(socket, `value 1`));
        this.addInput(`number 2`, new Classic.Input(socket, `value 2`));
        }
}
export class Multiply extends Classic.Node {

    constructor(socket:Classic.Socket) {
        super('multiply');
        this .addOutput("multiply",new Classic.Output(socket,"multiply") );
        this.addInput(`number 1`, new Classic.Input(socket, `value 1`));
        this.addInput(`number 2`, new Classic.Input(socket, `value 2`));
        }
}
export class Divide extends Classic.Node {
    constructor(socket:Classic.Socket) {
        super('divide');
        this .addOutput("divide",new Classic.Output(socket,"divide") );
        this.addInput(`number 1`, new Classic.Input(socket, `value 1`));
        this.addInput(`number 2`, new Classic.Input(socket, `value 2`));
        }
}