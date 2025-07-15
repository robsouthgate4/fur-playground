import { DrawSet, FLOAT, InstancedMesh, LINEAR, LINEAR_MIPMAP_LINEAR, Mesh,  NEAREST,  NONE,  Plane, Program, REPEAT, Texture2D } from "bolt-gl";
import { grassFragment, grassVertexInstanced } from "../shaders/grassShader";
import { mat4, vec3 } from "gl-matrix";

export default class Grass extends DrawSet {
    constructor({count = 10000}) {
        const plane1 = new Plane({
            width: 1.5,
            height: 2,
            heightSegments: 3,
            widthSegments: 2
        });

        const plane2 = new Plane({
            width: 1.5,
            height: 3,
            heightSegments: 3,
            widthSegments: 2
        });

        const transformMatrix = mat4.create();
        mat4.rotateY(transformMatrix, transformMatrix, Math.PI / 2);

        const stride = 3
        const tempVec3 = vec3.create();

        for(let i = 0; i < plane2.positions.length; i+=stride) {
            const x = plane2.positions[i];
            const y = plane2.positions[i + 1];
            const z = plane2.positions[i + 2];
            vec3.set(tempVec3, x, y, z);
            vec3.transformMat4(tempVec3, tempVec3, transformMatrix);
            plane2.positions[i] = tempVec3[0];
            plane2.positions[i + 1] = tempVec3[1];
            plane2.positions[i + 2] = tempVec3[2];
        }

        function updateIndices(geometry1, geometry2) {
            const posCount1 = geometry1.positions.length / 3;
            for( let i = 0; i < geometry2.indices.length; i++) {
                geometry2.indices[i] += posCount1;
            }
            return geometry1.indices.concat(geometry2.indices);
        }

        const combinedMesh = new Mesh({
            positions: plane1.positions.concat(plane2.positions),
            normals: plane1.normals.concat(plane2.normals),
            uvs: plane1.uvs.concat(plane2.uvs),
            indices: updateIndices(plane1, plane2)
        });

       
        const offsets = [];
        for(let i = 0; i < count; i++) {
            offsets[i * 3 + 0] = Math.random() * 130 - 65;
            offsets[i * 3 + 1] = 1.;
            offsets[i * 3 + 2] = Math.random() * 80 - 40;
        }

        const sortedOffsets = [];
        for(let i = 0; i < offsets.length; i += stride) {
            const pos = vec3.create();
            vec3.set(pos, offsets[i], offsets[i + 1], offsets[i + 2]);
            sortedOffsets.push(pos);
        }

        sortedOffsets.sort((a, b) => {
            return a[2] - b[2];
        });

        // flatten sortedOffsets
        const flattenedOffsets = [];
        for(let i = 0; i < sortedOffsets.length; i++) {
            flattenedOffsets.push(sortedOffsets[i][0]);
            flattenedOffsets.push(sortedOffsets[i][1]);
            flattenedOffsets.push(sortedOffsets[i][2]);
        }

        const scales = [];
        for(let i = 0; i < count; i++) {
            scales[i * 3 + 0] = 1 + Math.random() * 0.5;
            scales[i * 3 + 1] = 1 + Math.random() * 0.8;
            scales[i * 3 + 2] = 1 + Math.random() * 0.5;
        }
        

        const mesh = new InstancedMesh(combinedMesh, {
            instanceCount: count
        });

        const program = new Program(grassVertexInstanced, grassFragment);
        program.transparent = true;
        program.cullFace = NONE;
        mesh.setAttribute(new Float32Array(flattenedOffsets), 3, 3, FLOAT, 0, 1);
        mesh.setAttribute(new Float32Array(scales), 3, 4, FLOAT, 0, 1);

        const grassTexture = new Texture2D({
            imagePath: 'textures/grass.png',
            minFilter: LINEAR_MIPMAP_LINEAR,
            generateMipmaps: true   
        });

        const noiseTexture = new Texture2D({
            imagePath: 'textures/noise3D.jpg',
            minFilter: LINEAR,
            magFilter: LINEAR,
            wrapS: REPEAT,
            wrapT: REPEAT,
            generateMipmaps: false
        });
        
        noiseTexture.load().then(() => {
            program.setTexture('tNoise', noiseTexture);
        });

        grassTexture.load().then(() => {
            program.setTexture('tGrass', grassTexture);
        });

        super(mesh, program);
    }

    update(elapsed, delta) {
        this.program.setFloat('uTime', elapsed);
    }
}