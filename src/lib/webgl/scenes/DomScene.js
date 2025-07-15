import { Bolt, CameraPersp, DrawSet, Mesh,  Program, Texture2D, Orbit, GL_RESIZE_TOPIC, EventListeners, FRONT, FBO,  DracoLoader, Plane } from "bolt-gl";
import FBOScene from "../FBOScene";
import { testFragment, testVertex } from "../shaders/testShader";
import { mat4, quat,  vec3 } from "gl-matrix";
import Utils from "../../Utils";
import { domToWebGLCoords } from "../utils";
import { textFragment, textVertex } from "../shaders/textShader";


export default class DomScene extends FBOScene {
    constructor() {
        super();

        this.bolt = Bolt.getInstance();
        this.clearColor = [0.93, 0.93, 0.93, 1];
        
        
        this._camera = new CameraPersp({
            fov: 2 * Math.atan( (window.innerHeight / 2) / 600 ) * 180 / Math.PI,
            near: 0.1,
            far: 1000
        });

        this._camera.transform.positionZ = 600;
        this._camera.lookAt([0, 0, 0]);

        // this.orbit = new Orbit(this._camera, {
        //     maxRadius: 100,
        //     minRadius: 5,
        //     ease: 0.05
        // });

        this._eventListeners = EventListeners.getInstance();

        this._eventListeners.listen(GL_RESIZE_TOPIC, this.onResize.bind(this));

        this.init();

        this.onResize({
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });

        Utils.onAllCached = (cached) => {

            cached.forEach((element, i) => {

                const textProgram = new Program(textVertex, textFragment);
                textProgram.transparent = true;
                textProgram.setTexture("tMap", element.texture);


                const quad = new DrawSet(
                    new Mesh(
                        new Plane({
                            width: element.width,
                            height: element.height
                        }),
                    ),
                    textProgram
                );

                quad._renderOrder = cached.length - i;
                quad.transform.positionX = window.innerWidth / 2 - element.left - element.width / 2;
                quad.transform.positionY = window.innerHeight / 2 - element.top - element.height / 2;

                quad.setParent(this);
            });
        }


    }

    onResize(e) {

        return;

        const {width, height} = e.detail;
        this._camera.updateProjection(width / height);

    }

    async init() {
    }

    draw({elapsed, delta}) {

        return;
        
        this.bolt.setCamera(this._camera);
        
        super.draw();
    }
}