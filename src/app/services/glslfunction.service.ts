import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GLSLFunctionService {

  constructor() { }
  add(num1:number, num2:number)
  {

  }
  subtract()
  {

  }
convertToGLSLFLoat(num:number)
{
  let floatData = num+0.0;
  return floatData;
}

}
