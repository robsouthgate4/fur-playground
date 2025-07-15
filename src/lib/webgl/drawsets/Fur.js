import { DrawSet, FLOAT, InstancedMesh, LINEAR, LINEAR_MIPMAP_LINEAR, Mesh,  NEAREST,  NONE,  Plane, Program, REPEAT, Texture2D } from "bolt-gl";
import { furFragment, furVertexInstanced } from "../shaders/furShader";
import { mat4, vec2, vec3 } from "gl-matrix";
import { basicVertex, basicFragment } from "../shaders/basicShader";

export default class Fur extends DrawSet {
    constructor({count = 10000}) {
        const plane1 = new Plane({
            width: 0.1,
            height: 0.8,
            heightSegments: 10,
            widthSegments:2
        });

        const transformMatrix = mat4.create();
        mat4.rotateX(transformMatrix, transformMatrix, Math.PI / 2);

        const stride = 3
        const tempVec3 = vec3.create();

        const hairMesh = new Mesh({
            positions: plane1.positions,
            normals: plane1.normals,
            uvs: plane1.uvs,
            indices: plane1.indices
        });

        const maxX = 8;
        const maxZ = 4;

       
        const offsets = [];
        for(let i = 0; i < count; i++) {
            offsets[i * 3 + 0] = Math.random() * maxX - maxX / 2;
            offsets[i * 3 + 1] = 0.;
            offsets[i * 3 + 2] = Math.random() * maxZ - maxZ / 2;
        }

        const sortedOffsets = [];
        for(let i = 0; i < offsets.length; i += stride) {
            const pos = vec3.create();
            vec3.set(pos, offsets[i], offsets[i + 1], offsets[i + 2]);
            //vec3.transformMat4(pos, pos, transformMatrix);
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
            scales[i * 3 + 0] = 0.1
            scales[i * 3 + 1] = 0.1
            scales[i * 3 + 2] = 0.1
        }
        

        const mesh = new InstancedMesh(hairMesh, {
            instanceCount: count
        });

        const program = new Program(furVertexInstanced, furFragment);
        program.setVector2('uMax', vec2.fromValues(maxX / 2, maxZ / 2));
        program.setVector2('uMin', vec2.fromValues(-maxX / 2, -maxZ / 2));
        program.transparent = true;
        program.cullFace = NONE;
        mesh.setAttribute(new Float32Array(flattenedOffsets), 3, 3, FLOAT, 0, 1);
        mesh.setAttribute(new Float32Array(scales), 3, 4, FLOAT, 0, 1);

        const furTexture = new Texture2D({
            imagePath: 'textures/fur.jpg',
            minFilter: LINEAR_MIPMAP_LINEAR,
            generateMipmaps: true   
        });

        const patternTexture = new Texture2D({
            imagePath: 'textures/mammal_m_crisp.png',
            minFilter: LINEAR,
            magFilter: LINEAR,
            wrapS: REPEAT,
            wrapT: REPEAT,
        });

        const noiseTexture = new Texture2D({
            imagePath: 'textures/curl.jpeg',
            minFilter: LINEAR,
            magFilter: LINEAR,
            wrapS: REPEAT,
            wrapT: REPEAT,
            generateMipmaps: false
        });
        
        noiseTexture.load().then(() => {
            program.setTexture('tNoise', noiseTexture);
        });

        patternTexture.load().then(() => {
            program.setTexture('tPattern', patternTexture);
        });

        furTexture.load().then(() => {
            program.setTexture('tFur', furTexture);
        });

        const plane = new Mesh(new Plane({
            width: 8,
            height: 4,
            widthSegments: 1,
            heightSegments: 1
        }));

        const planeProgram = new Program(basicVertex, basicFragment);
        planeProgram.setTexture('tMap', patternTexture);
        const planeDrawSet = new DrawSet(plane, planeProgram);
        planeDrawSet.transform.positionY = -0.08;
        planeDrawSet.transform.rotateX(Math.PI / 2);

        super(mesh, program);



        //this.transform.rotateX(Math.PI / 2);

        planeDrawSet.setParent(this);
    }

    update(elapsed, delta) {
        this.program.setFloat('uTime', elapsed);
    }
}