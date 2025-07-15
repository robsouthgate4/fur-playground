import { Bolt, COLOR_ATTACHMENT0, DrawSet, EventListeners, FBO, FLOAT, GL_RESIZE_TOPIC, LINEAR, Mesh, Node, Pass, Post, Program, RGBA, RGBA32f, ShaderPass, Texture2D } from "bolt-gl";
import { homeSceneFragment, homeSceneVertex } from "./scenes/HomeSceneShader";
import { mat4 } from "gl-matrix";
import Global from "./Global";


export default class FBOScene extends Node {

    constructor({
        depth = true,
        stencil = false,
        msaaSamples = 0,
        dpi = 1,
        attachments = []
    } = {}) {

        super();

        const bolt = Bolt.getInstance();

        this.frameSkip = 0;

        this._inverseView = mat4.create();
        this._inverseProjection = mat4.create();
        this._dpi = dpi;
        this._width = bolt.gl.canvas.width;
        this._height = bolt.gl.canvas.height;

        const postWidth  = window.innerWidth < 768 ? this._width * 0.8 : this._width;
        const postHeight = window.innerWidth < 768 ? this._height * 0.8 : this._height;

        this._fbo = new FBO( { width: this._width, height: this._height, depth, stencil, format: RGBA,  } );
        this._postFBO = new FBO( { width: postWidth, height: postHeight, depth, stencil, format: RGBA        } );

        if(attachments.length > 0){
            this._fbo.bind();
            for(let i = 0; i < attachments.length; i++){
                this._fbo.addAttachment(attachments[i], i + 1);
            }
            this._fbo.setDrawBuffers();
            this._fbo.unbind();
        }

        this._clearColor = [1, 1, 1, 1];

        this._eventListeners = EventListeners.getInstance();
        this._eventListeners.listen(GL_RESIZE_TOPIC, this.onResize.bind(this));

        const triangleVertices = [-1, -1, 0, -1, 4, 0, 4, -1, 0];
        const triangleIndices = [2, 1, 0];

        this.fullScreenTriangle = new Mesh({
            positions: triangleVertices,
            indices: triangleIndices,
        });

        // this._effectsDrawSet = new DrawSet(
        //     this.fullScreenTriangle,
        //     new Program(homeSceneVertex, homeSceneFragment)
        // );

        //this._effectsDrawSet.program.setTexture('map', this._fbo.targetTexture);
        // this._effectsDrawSet.program.setTexture('gBufferPositions', this._fbo.attachmentsTextures[0]);
        // this._effectsDrawSet.program.setTexture('gBufferNormals', this._fbo.attachmentsTextures[1]);
        // this._effectsDrawSet.program.setTexture('gBufferExtra', this._fbo.attachmentsTextures[2]);

    }

    onResize(e){
        this._fbo.resize(this.canvas.width, this.canvas.height);
        this._width = width;
        this._height = height;
    }

    setDPI(dpi){
        this._dpi = dpi;
    }

    draw(customFBO = false, camera = null){

        if(!this.draw) return;

        this.frameSkip++;

        // render to fbo
        if(!customFBO)this._fbo.bind();
		this.bolt.clear( ...this._clearColor );
        this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
        this.bolt.draw(this);
        if(!customFBO)this._fbo.unbind();

        // draw our effects pass
        // if(this.frameSkip % 2 === 0){
        //     this._postFBO.bind();
        //     mat4.invert(this._inverseView, this.bolt.activeCamera.view);
        //     this._effectsDrawSet.program.setMatrix4('inverseView', this._inverseView);

        //     mat4.invert(this._inverseProjection, this.bolt.activeCamera.projection);
        //     this._effectsDrawSet.program.setMatrix4('inverseProjection', this._inverseProjection);

        //     this.bolt.clear( ...this._clearColor );
        //     this.bolt.draw(this._effectsDrawSet);
        //     this._postFBO.unbind();
        // }
    }

    set clearColor(color){
        this._clearColor = color;
    }

    get fbo(){
        return this._fbo;
    }

    get postFBO(){
        return this._postFBO;
    }

}