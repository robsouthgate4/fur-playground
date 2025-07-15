import { Bolt, DrawSet, Mesh, Program, Texture2D } from "bolt-gl";
import {compositeVertex, compositeFragment} from "./shaders/compositeShader.js";
import { mat4, vec2, vec3 } from "gl-matrix";
import UIPane from "../UIPane.js";

export default class FBOSceneComposite {
    constructor({
        scenes = []
    } = {}) {

        this.scenes = scenes;

        this.bolt = Bolt.getInstance();

        this.projInverse = mat4.create();
        this.viewInverse = mat4.create();

		const triangleVertices = [
    		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
    	];

    	const triangleIndices = [
    		2, 1, 0
    	];

    	this.fullScreenTriangle = new Mesh( {
    		positions: triangleVertices,
    		indices: triangleIndices
    	} );

        this.drawSet = new DrawSet(
            this.fullScreenTriangle,
            new Program( compositeVertex, compositeFragment )
        )

        scenes.forEach((scene, index) => {
            const fbo = scene.fbo;
            const postFbo = scene.postFBO;
            this.drawSet.program.setTexture(`tMap${index + 1}`, fbo.targetTexture);
            this.drawSet.program.setTexture(`tPostMap${index + 1}`, postFbo.targetTexture);
        });

        const noise = new Texture2D({
            imagePath: '/textures/rgba-noise.png',
            generateMipmaps: false
        });

        noise.load().then(() => {
            console.log('noise loaded');
            this.drawSet.program.setTexture('tNoise', noise);
        });

        this.drawSet.program.setVector2('resolution', vec2.fromValues(window.innerWidth, window.innerHeight));        


        // const params = {
        //     light1Position: {x: 0, y: 0, z: 0},
        //     light2Position: {x: 0, y: 0, z: 0},
        //     light3Position: {x: 0, y: 0, z: 0},
        //     light1Color: {r: 1, g: 1, b: 1},
        //     light2Color: {r: 1, g: 1, b: 1},
        //     light3Color: {r: 1, g: 1, b: 1}
        // }

        // this.pane = new UIPane('composite', null, params);
        // this.pane.addBinding(params, 'light1Position');
        // this.pane.addBinding(params, 'light2Position');
        // this.pane.addBinding(params, 'light3Position');
        // this.pane.addBinding(params, 'light1Color');
        // this.pane.addBinding(params, 'light2Color');
        // this.pane.addBinding(params, 'light3Color');
        
        // this.pane.on('change', (event) => {
        //     if(event.target.key === 'light1Position') {
        //         this.drawSet.program.setVector3('light1Position', vec3.fromValues(event.value.x, event.value.y, event.value.z));
        //     }
        //     if(event.target.key === 'light2Position') {
        //         this.drawSet.program.setVector3('light2Position', vec3.fromValues(event.value.x, event.value.y, event.value.z));
        //     }
        //     if(event.target.key === 'light3Position') {
        //         this.drawSet.program.setVector3('light3Position', vec3.fromValues(event.value.x, event.value.y, event.value.z));
        //     }
        //     if(event.target.key === 'light1Color') {
        //         this.drawSet.program.setVector3('light1Color', vec3.fromValues(event.value.r / 255, event.value.g / 255, event.value.b / 255));
        //     }
        //     if(event.target.key === 'light2Color') {
        //         this.drawSet.program.setVector3('light2Color', vec3.fromValues(event.value.r / 255, event.value.g / 255, event.value.b / 255));
        //     }
        //     if(event.target.key === 'light3Color') {
        //         this.drawSet.program.setVector3('light3Color', vec3.fromValues(event.value.r / 255, event.value.g / 255, event.value.b / 255));
        //     }
        // });
    }

    resize(width, height){
        this.scenes.forEach((scene, index) => {
            scene.fbo.resize(width, height);
        });
    }

    get program() {
        return this.drawSet.program;
    }

    draw({elapsed, delta}) {

        mat4.invert(this.projInverse, this.bolt.camera.projection);
        mat4.invert(this.viewInverse, this.bolt.camera.view);

        this.drawSet.program.setMatrix4('projectionInverse', this.projInverse);
        this.drawSet.program.setMatrix4('viewInverse', this.viewInverse);
        this.drawSet.program.setVector3('cameraPosition', this.bolt.camera.position);
        this.drawSet.program.setFloat('time', elapsed);
        
        this.bolt.draw(this.drawSet);
    }
}