import {Bolt,Program, InstancedMesh, VBO, FLOAT, TransformFeedback, DrawSet, STATIC_DRAW,INTERLEAVED_ATTRIBS, DYNAMIC_COPY, NONE} from "bolt-gl";

import { computeVertex, computeFragment} from "./VFXShader";
import { leavesShadowFragment, leavesShadowVertex } from "../../drawsets/leaves/leavesShader";
import Global from "../../Global";

export default class VFX {
    constructor(geometry, program, points) {
        this.bolt = Bolt.getInstance();

        this.writeIndex = 0;

        // reduce points by half
        if(Global.isMobile) {
            points = points.slice(0, Math.floor(points.length / 2));
        }

        let initPosition = points;

        initPosition = [...initPosition, ...initPosition];

        this.particleCount = initPosition.length / 3;

        this.queue = [];
        

        this._mesh = new InstancedMesh(
            geometry,
            {
                program,
                instanceCount: this.particleCount,
            }
        );

        // Create interleaved data array
        // Format per particle: [px,py,pz, vx,vy,vz, life,rate,end]
        this.stride = 9; // 3 for position + 3 for velocity + 3 for life data
        this.interleavedData = new Float32Array(this.particleCount * this.stride);

        const initPositions = new Float32Array(this.particleCount * 3);
        
        // Fill interleaved data
        for(let i = 0; i < this.particleCount; i++) {
            const baseIndex = i * this.stride;
            const sourceIndex = i * 3;

            const range = 10;

            const x = initPosition[sourceIndex + 0];
            const y = initPosition[sourceIndex + 1];
            const z = initPosition[sourceIndex + 2];
    
            initPositions[sourceIndex + 0] = x;
            initPositions[sourceIndex + 1] = y;
            initPositions[sourceIndex + 2] = z;

            // Position
            this.interleavedData[baseIndex + 0] = x;
            this.interleavedData[baseIndex + 1] = y;
            this.interleavedData[baseIndex + 2] = z;
            
            // Velocity (initialized to 0)
            this.interleavedData[baseIndex + 3] = 0;
            this.interleavedData[baseIndex + 4] = 0;
            this.interleavedData[baseIndex + 5] = 0;
            
            //  Life data
            this.interleavedData[baseIndex + 6] = 0; // start
            this.interleavedData[baseIndex + 7] = 0; // rate
            this.interleavedData[baseIndex + 8] = 0; // end
        }


        this.t = 0;

        // Create static attributes (rotation and size)
        const rotationArray = new Float32Array(this.particleCount * 3);
        const sizeArray = new Float32Array(this.particleCount);
        
        for(let i = 0; i < this.particleCount; i++) {
            const rotIndex = i * 3;
            rotationArray[rotIndex + 0] = Math.random() * 2 - 1;
            rotationArray[rotIndex + 1] = Math.random() * 2 - 1;
            rotationArray[rotIndex + 2] = Math.random() * 2 - 1;
            sizeArray[i] = Math.min(Math.random() * 0.5, 0.35) + 0.1;
        }

        // Create the interleaved VBOs
        this.vboA = new VBO(new Float32Array(this.interleavedData), DYNAMIC_COPY);
        this.vboB = new VBO(new Float32Array(this.particleCount * this.stride), DYNAMIC_COPY);

        this.readBuffer = new Float32Array(this.particleCount * this.stride);
        this.writeBuffer = new Float32Array(this.particleCount * this.stride);
        
        // Initial position buffer for resetting
        const initPosVBO = new VBO(initPositions, STATIC_DRAW);

        this.tf = new TransformFeedback({
            bolt: this.bolt,
            count: this.particleCount,
            stride: this.stride
        });

        //this.tf.logBufferContents(true, 0);

        this.tfProgram = new Program(computeVertex, computeFragment, {
            transformFeedbackVaryings: ['newPosition', 'newVelocity', 'newLife'],
            transformFeedbackVaryingType: INTERLEAVED_ATTRIBS
        });
        
        // Bind the interleaved VAOs
        this.tf.bindVAOS([
            {
                // position
                attributeLocation: 0,
                requiresSwap: true,
                read: this.vboA,
                write: this.vboB,
                size: 3,
                stride: this.stride * 4,
                offset: 0
            },
            {
                //velocity
                attributeLocation: 1,
                requiresSwap: true,
                read: this.vboA,
                write: this.vboB,
                size: 3,
                stride: this.stride * 4,
                offset: 12  // 3 floats * 4 bytes
            },
            {
                // life
                attributeLocation: 2,
                requiresSwap: true,
                read: this.vboA,
                write: this.vboB,
                size: 3,
                stride: this.stride * 4,
                offset: 24  // 6 floats * 4 bytes
            },
            {
                // start position
                attributeLocation: 3,
                requiresSwap: false,
                read: initPosVBO,
                write: initPosVBO,
                size: 3
            }
        ]);       

        // Set static attributes
        this._mesh.setAttribute(rotationArray, 3, 4, FLOAT, 0, 1);
        this._mesh.setAttribute(sizeArray, 1, 5, FLOAT, 0, 1);

        program.setMatrix4('lightSpaceMatrix', Global.lightSpaceMatrix);
        
        this._drawSet = new DrawSet(this._mesh, program);

        this._shadowProgram = new Program(leavesShadowVertex, leavesShadowFragment);

		this._shadowMesh = new InstancedMesh(geometry, {
			program: this._shadowProgram,
			instanceCount: this.particleCount
		});

        this._shadowMesh.setAttribute(rotationArray, 3, 4, FLOAT, 0, 1);
        this._shadowMesh.setAttribute(sizeArray, 1, 5, FLOAT, 0, 1);
        
        this._shadowDrawSet = new DrawSet(this._shadowMesh, this._shadowProgram);
        this._shadowProgram.setMatrix4('lightSpaceMatrix', Global.lightSpaceMatrix);
        this._shadowProgram.cullFace = NONE;

        setInterval(() => {            
            const count = 350;
            const pos = new Float32Array(count * 3);    
            const vel = new Float32Array(count * 3).fill(0);
            const life = new Float32Array(count).fill(0);

            for(let i = 0; i < count; i++) {
                const randPos = Math.floor(Math.random() * (initPosition.length / 3));
                
                pos[i * 3 + 0] = initPosition[randPos * 3];
                pos[i * 3 + 1] = initPosition[randPos * 3 + 1];
                pos[i * 3 + 2] = initPosition[randPos * 3 + 2];
            }
            this.emit(pos, vel, life);
        }, 50);
        
    }

    flushEmits({position, velocity, life}) {
        const vbo = this.tf.getReadVBO(0); // must write to the read buffer
        const vbo2 = this.tf.getWriteVBO(0);
        const buffer = vbo.data;
        const n = position.length / 3;
    
        for (let i = 0; i < n; i++) {
            const idx = (this.writeIndex + i) % this.particleCount;
            const base = idx * this.stride;
            const src = i * 3;
    
            buffer[base + 0] = position[src + 0];
            buffer[base + 1] = position[src + 1];
            buffer[base + 2] = position[src + 2];
    
            buffer[base + 3] = velocity ? velocity[src + 0] : 0;
            buffer[base + 4] = velocity ? velocity[src + 1] : 0;
            buffer[base + 5] = velocity ? velocity[src + 2] : 0;
    
            buffer[base + 6] = life ? life[i] : 0;
            buffer[base + 7] = 1;
            buffer[base + 8] = 1;
        }
    
        const floatOffset = this.writeIndex * this.stride;
        const byteOffset = floatOffset * 4;
        const floatCount = n * this.stride;
    
        const view = buffer.subarray(floatOffset, floatOffset + floatCount);
        vbo.update(view, byteOffset);
        vbo2.update(view, byteOffset);
    
        this.writeIndex = (this.writeIndex + n) % this.particleCount;
    }

    emit(position, velocity, life) {
        this.queue.push({position, velocity, life});
    }

    compute(elapsed, delta) {

        this.queue.forEach(emit => {
            this.flushEmits(emit);            
        });

        this.queue = [];

        this.tfProgram.setFloat('uTime', elapsed);
        this.tf.compute(this.tfProgram);


        this._mesh.setVBO(this.tf.getWriteVBO(0), 3, 3, FLOAT, 0, 1, this.stride * 4);
        this._mesh.setVBO(this.tf.getWriteVBO(2), 3, 6, FLOAT, 6 * 4, 1, this.stride * 4);

        this._shadowMesh.setVBO(this.tf.getWriteVBO(0), 3, 3, FLOAT, 0, 1, this.stride * 4);
        this._shadowMesh.setVBO(this.tf.getWriteVBO(2), 3, 6, FLOAT, 6 * 4, 1, this.stride * 4);


        // const readBuffer = this.tf.getReadVBO(0);
        // const data = readBuffer.getData(this.readBuffer, 0);
        // console.log(data[6]);

        // const writeBuffer = this.tf.getWriteVBO(0);
        // const writeData = writeBuffer.getData(this.writeBuffer, 0);
        // console.log(writeData[6], writeData[7]);
    }

    get mesh() {
        return this._mesh;
    }

    get drawSet() {
        return this._drawSet;
    }

    get shadowDrawSet() {
        return this._shadowDrawSet;
    }
    
    
}