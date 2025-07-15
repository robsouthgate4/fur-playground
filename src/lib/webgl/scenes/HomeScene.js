import { Bolt, CameraPersp, DrawSet, Mesh, Program, Orbit, GL_RESIZE_TOPIC, EventListeners, BlenderSceneLoader, PointCloudLoader, FBO, FLOAT, RGBA, RGBA16F,  CameraOrtho, Sphere, Texture2D, LINEAR, Cube, GLTFLoader} from "bolt-gl";
import FBOScene from "../FBOScene";
import { mat4, vec3 } from "gl-matrix";
import { backgroundFragment, backgroundVertex } from "../shaders/backgroundShader";
import Tree from "../drawsets/Tree";
import Leaves from "../drawsets/leaves/Leaves";
import Global from "../Global";
import { normalFragment, normalVertex } from "../shaders/normalShader";
import { PBRMatcapFragment, PBRMatcapVertex } from "../shaders/PBRMatcap";
import FloorProgram from "../materials/FloorProgram";
import PillarProgram from "../materials/PillarProgram";
import { colorFragment, colorVertex } from "../shaders/colorShader";

export default class HomeScene extends FBOScene {
    constructor() {

        const bolt = Bolt.getInstance();

        // multiple draw buffer settings for deferred rendering
        const drawBufferSettings = {
            width: bolt.gl.canvas.width,
            height: bolt.gl.canvas.height,
            format: RGBA,
            type: FLOAT,
            internalFormat: RGBA16F,
            minFilter: LINEAR,
            magFilter: LINEAR,
            generateMipmaps: false,
        }

        const normalTexture = new Texture2D(drawBufferSettings);
        const positionTexture = new Texture2D(drawBufferSettings);
        const extraTexture = new Texture2D(drawBufferSettings);

        
        super({
            attachments: [normalTexture, positionTexture, extraTexture]
        });

        this.bolt = bolt;

        this.clearColor = [0, 0, 0, 1];

        this.canvas = this.bolt._gl.canvas;
        this.shadowFBO = new FBO({ width: 512, height: 512, depth: true });
    
        Global.lightSpaceMatrix = mat4.create();
        Global.shadowFBO = this.shadowFBO;

        this._camera = new CameraPersp( {
            aspect: this.canvas.width / this.canvas.height,
            fov: 75,
            far: 1000,
            near: 0.1,
            position: vec3.fromValues( 0, 6.5511, 23.46498 ),
            target: vec3.fromValues( 0, 6, 0),
        } );

        this.orbit = new Orbit(this._camera, {
            maxRadius: 150,
            minRadius: 5,
            ease: 0.05,
            zoom: 0.01,
            zoomSpeed: 5,
            minElevation: -Math.PI / 2,
            maxElevation: Math.PI / 2
        });

        this._eventListeners = EventListeners.getInstance();
        this._eventListeners.listen(GL_RESIZE_TOPIC, this.onResize.bind(this));

        this.init();

        this.textures = []
        this.objects = [];
        
        this.bolt.setCamera(this._camera);

        this.onResize({
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });


    }

    isMobile() {
        return window.innerWidth < 768;
    }

    onResize(e) {
        const {width, height} = e.detail;
        this._camera.updateProjection(width / height);
    }

    async init() {

        const scene = new BlenderSceneLoader();
        await scene.load('/models');
        scene.objects.forEach(this.handleDrawset.bind(this));

        const pointCloudLoader = new PointCloudLoader();
        await pointCloudLoader.load('/pointclouds/points.boltpc');
        const pointCloud = pointCloudLoader;
        const frustumSize = 30;

		this.shadowLight = new CameraOrtho({
			left: - frustumSize,
			right: frustumSize,
			bottom: - frustumSize,
			top: frustumSize,
			near: 1,
			far: 100,
			position: vec3.fromValues(0, 60, 10),
			target: vec3.fromValues(0, 0, -1),
		});

        this.debug = new DrawSet(new Mesh(new Cube()), new PillarProgram());
        this.debug.transform.scale = vec3.fromValues(8,8,8);

        this.debug.transform.position = vec3.fromValues(0, 4, 3);
        // /this.debug.setParent(this);

    
        mat4.multiply(Global.lightSpaceMatrix, this.shadowLight.projection, this.shadowLight.view);
        
        this.leaves = new Leaves({
            points: pointCloud.points,
        });

        this.leaves.setParent(this);

        this.ready = true;
    }

    async handleDrawset(object){

        const mesh = new Mesh(object.meshData);

        let program = null;
        let ds = null;

        console.log(object.name, object);

        
        switch(object.name) {
            case 'floor':
                program = new FloorProgram();
                break;
            case 'background':
                program = new Program(backgroundVertex, backgroundFragment);
                break;
            case 'tree':
                program = new PillarProgram();
                ds = new Tree(mesh, program);
                break;
            default:
                program = new Program(backgroundVertex, backgroundFragment);
                break;
        }

        if(object.name.includes('Light')) {
            program = new Program(colorVertex, colorFragment);
            const yellow = vec3.fromValues(1, 0.9, 0.7);
            program.setVector3('uColor', yellow);
        }
        if(object.name.includes('Pillar')) {
            program = new PillarProgram();
        }
        
        if(object.name.includes('Plane')) {
            program = new Program(normalVertex, normalFragment);
        }
        if(object.name.includes('Plinth')) {
            program = new FloorProgram();
        }


        if(!ds) {
            ds = new DrawSet(mesh, program);
        }
        
        ds.name = object.name;

        ds.setParent(this);

        this.objects.push(ds);
         
    
    }

    handleInstancedDrawset(object){
        
    }

    draw({elapsed, delta}) { 
        if (!this.ready) return;

        this.debug.transform.rotateY(0.01)

        this.shadowFBO.bind();
        this.bolt.clear(0,0,0,1);
        this.bolt.setCamera(this.shadowLight);
        this.bolt.draw(this.leaves.particles.shadowDrawSet);
        this.shadowFBO.unbind();

    
        this.leaves.update(elapsed, delta);
        this.orbit.update();
        this.bolt.setCamera(this._camera);
        super.draw(null, this._camera);
    }
}
