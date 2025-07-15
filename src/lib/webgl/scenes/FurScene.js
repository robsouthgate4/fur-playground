import { Bolt, CameraPersp, DrawSet, Mesh, Cube, Program, Texture2D, Orbit, GL_RESIZE_TOPIC, EventListeners, DracoLoader, TextureCube, Sphere, LINEAR_MIPMAP_LINEAR, LINEAR } from "bolt-gl";
import FBOScene from "../FBOScene";
import { mat4, vec3 } from "gl-matrix";
import { normalFragment, normalVertex } from "../shaders/normalShader";
import Fur from "../drawsets/Fur";
import { basicFragment, basicVertex } from "../shaders/basicShader";
export default class FurScene extends FBOScene {
    constructor() {
        
        super({
            msaaSamples: 0
        });
        
        this.bolt = Bolt.getInstance();

        const col = 241 / 255;
        this.clearColor = [0,0,0, 1];

        this.canvas = this.bolt._gl.canvas;

        this._camera = new CameraPersp( {
            aspect: this.canvas.width / this.canvas.height,
            fov: 45,
            near: 0.1,
            far: 500,
            position: vec3.fromValues( 0, 4.5, 0)
        } );

        this._camera.transform.lookAt(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1));

        this._eventListeners = EventListeners.getInstance();

        this._eventListeners.listen(GL_RESIZE_TOPIC, this.onResize.bind(this));

        this.init();


        this.fur = new Fur({
            count: 100000
        });

        this.fur.setParent(this);


        this.onResize({
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });

    }

    onResize(e) {
        const {width, height} = e.detail;
        this._camera.updateProjection(width / height);
    }

    async init() {

        
    }

    draw({elapsed, delta}) {

        this.fur.update(elapsed, delta);

        this.bolt.setCamera(this._camera);

        super.draw();
    }
}