import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ObjFileParser from 'obj-file-parser';

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  fileVertexData!: string;
  vertexData!: Float32Array;

  constructor(private http: HttpClient) {}
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
  getIcoSphereData() {}
  getUVSphere() {
    const positions = [];
    const numSlices = 30;
    const numStacks = 30;
    const radius = 0.5;
    const normals = [];
    const uv = [];

    const thetaLength = Math.PI / numStacks;
    const phiLength = (2 * Math.PI) / numSlices;
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
  getINdecises() {
    const numSlices = 30;
    const numStacks = 30;
    // Generate triangle strip indices
    const indices = [];
    for (let y = 0; y < numStacks; y++) {
      for (let x = 0; x < numSlices; x++) {
        const first = y * (numSlices + 1) + x;
        const second = first + 1;
        const third = (y + 1) * (numSlices + 1) + x;
        const fourth = third + 1;

        indices.push(first, second, third);
        indices.push(second, fourth, third);
      }
    }
    return new Uint8Array(indices);
  }

  private fetchOBJ(filename: any) {
    this.http.get(filename, { responseType: 'text' }).subscribe((data) => {
      this.fileVertexData = data;
    });
  }

  // Function to parse OBJ file
  parseOBJ(objData: any) {
    let vertices: any[] = [];
    let normals: any[] = [];

    let faces: any[] = [];
    let vertexData :number[]=[];
    let normalData :number[]=[];


    // Split the file content into lines
    const lines = objData.split('\n');

    // Iterate over each line
    lines.forEach((line: string) => {
      // Split the line into tokens
      const tokens = line.trim().split(/\s+/);

      // Check the type of line
      switch (tokens[0]) {
        case 'v':
          // Vertex line
          vertices.push({
            x: parseFloat(tokens[1]),
            y: parseFloat(tokens[2]),
            z: parseFloat(tokens[3]),
          });
          break;
          case 'vn':
            // Vertex line
            normals.push({
              x: parseFloat(tokens[1]),
              y: parseFloat(tokens[2]),
              z: parseFloat(tokens[3]),
            });
            break;
        case 'f':
          const faceVertices =[];
        tokens.forEach((face:any)=>
          {
            if(face !="f")
              {
                const faceData= face.split("/");
                const vertex=vertices[faceData[0]-1];
                const normal=normals[faceData[2]-1];

                if(vertex)
                  {
                    vertexData.push(vertex.x,vertex.y,vertex.z)
                  }
                  if(normal)
                  {
                    normalData.push(normal.x,normal.y,normal.z)

                  }

              }
            

          }

);
          break;
        // Add cases for other types of lines (e.g., normals, textures) if needed
      }
    });
   
    return { vertices: vertexData,normals:normalData };
  }
  getSphere() {
    return this.getObjData('../../assets/UVSphere.obj').pipe(
      map((res) => {
        const objectData = this.parseOBJ(res);
        return objectData;
      })
    );
  }
  getCube() {
    return this.getObjData('../../assets/cube.obj').pipe(
      map((res) => {
        const objectData = this.parseOBJ(res);
        return objectData;
      })
    );
  }
  getCylinder() {
    return this.getObjData('../../assets/cylinder.obj').pipe(
      map((res) => {
        const objectData = this.parseOBJ(res);
        return objectData;
      })
    );
  }
  getImportedMesh(fileContent:any)
  {
        const objectData = this.parseOBJ(fileContent);
        return objectData;
    

  }


  getIcoSphere() {
    return this.getObjData('../../assets/IcoSphere.mtl.obj').pipe(
      map((res) => {
        const objectData = this.parseOBJ(res);
        return objectData;
      })
    
    );
  }
  getObjData(file: string) {
    return this.http.get(file, { responseType: 'text' });
  }

  parseVertexData(data: string) {
    const parser = new ObjFileParser(data);
    const objData = parser.parse();
    return objData;
  }
}
