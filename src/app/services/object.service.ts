import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  constructor() {}
  getCubeVertexData() {
    const vertexData: number[] = [
      // Front
      0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5,
      0.5, -0.5, -0.5, 0.5,

      // Left
      -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5, -0.5, -0.5,

      // Back
      -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5, -0.5, -0.5,

      // Right
      0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
      0.5, 0.5, -0.5, -0.5,

      // Top
      0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
      -0.5, -0.5, 0.5, -0.5,

      // Bottom
      0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
      -0.5, -0.5, -0.5, -0.5, -0.5,
    ];
    return new Float32Array(vertexData);
  }
  getPlaneVertexData() {
    const vertexData = [
      // Front
      0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5,
      0.5, -0.5, -0.5, 0.5,
    ];
    return new Float32Array(vertexData);
  }
  getCubeVertexNormal(): Float32Array {
    function repeat(n: number, pattern: number[]) {
      return [...Array(n)].reduce((sum) => sum.concat(pattern), []);
    }
    const vertexNormal: number[] = [
      ...repeat(6, [0, 0, 1]), // Z+
      ...repeat(6, [-1, 0, 0]), // X-
      ...repeat(6, [0, 0, -1]), // Z-
      ...repeat(6, [1, 0, 0]), // X+
      ...repeat(6, [0, 1, 0]), // Y+
      ...repeat(6, [0, -1, 0]), // Y-
    ];
    return new Float32Array(vertexNormal);
  }
  getIcoSphereData()
  {
    
  }
  getUVSphere()
  {
  
   
    const positions = [];
    const numSlices = 30;
    const numStacks = 30;
    const radius = 0.5;
    const normals = [];
    const uv = [];
  
    const thetaLength = Math.PI / numStacks;
    const phiLength = 2 * Math.PI / numSlices;
    for (let y = 0; y <= numStacks; y++) {
      for (let x = 0; x <= numSlices; x++) {
        const theta = y * thetaLength;
        const phi = x * phiLength;

          
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const ux = 1 - x / numSlices;
        const vy = 1 - y / numStacks;
  
        const x2 = cosPhi * sinTheta;
        const y2 = cosTheta;
        const z2 = sinPhi * sinTheta;
  
        positions.push(radius * x2, radius * y2, radius * z2);
        normals.push(x2, y2, z2);
        uv.push(ux, vy);
  

      
      }    
    }
    
 
  
  
    return new Float32Array(positions);
  }
  getINdecises()
  {
    const numSlices = 30;
    const numStacks = 30;
    // Generate triangle strip indices
    const indices = [];
    for (let y = 0; y < numStacks; y++) {
      for (let x = 0; x < numSlices; x++) {
        const first = (y * (numSlices + 1)) + x;
        const second = first + 1;
        const third = (y + 1) * (numSlices + 1) + x;
        const fourth = third + 1;
  
        indices.push(first, second, third);
        indices.push(second, fourth, third);
      }
    }
    return new Uint8Array(indices);
  }
}
