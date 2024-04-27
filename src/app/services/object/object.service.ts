import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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


  // Function to parse OBJ file
  parseOBJ(objData: any) {
    let vertices: any[] = [];
    let normals: any[] = [];
    let textureCoordinate: any[] = [];

    let faces: any[] = [];
    let vertexData :number[]=[];
    let normalData :number[]=[];
    let TextureCoordData :number[]=[];


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
            case 'vt':
            // Vertex line
            textureCoordinate.push({
              x: parseFloat(tokens[1]),
              y: parseFloat(tokens[2])
            });
            break;
        case 'f':
          const faceVertices =[];
          console.log(tokens);

        tokens.forEach((face:any)=>
          {
            if(face !="f")
              {
                const faceData= face.split("/");
                const vertex=vertices[faceData[0]-1];
                const normal=normals[faceData[2]-1];
                const textureCoord=textureCoordinate[faceData[1]-1];

                if(vertex)
                  {
                    vertexData.push(vertex.x,vertex.y,vertex.z)
                  }
                  
                if(textureCoord)
                  {
                    TextureCoordData.push(textureCoord.x,textureCoord.y)
                  }
                  if(normal)
                  {
                    normalData.push(normal.x,normal.y,normal.z)

                  }

              }
            

          }

);

          break;
      }
    });
   
    return { vertices: vertexData,normals:normalData,textCoord:TextureCoordData };
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


}