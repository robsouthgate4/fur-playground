import { Bolt, CameraPersp, DrawSet, Mesh, Cube, Program, Texture2D, Orbit, GL_RESIZE_TOPIC, EventListeners, DracoLoader, TextureCube, Sphere, LINEAR_MIPMAP_LINEAR, LINEAR } from "bolt-gl";
import FBOScene from "../FBOScene";
import { basicFragment, basicVertex } from "../shaders/basicShader";
import { vec3 } from "gl-matrix";
export default class ReflectionScene extends FBOScene {
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
            position: vec3.fromValues( 0, 4.5, 0),
            target: vec3.fromValues( 0, 0, 0),
        } );

        this.orbit = new Orbit(this._camera, {
            maxRadius: 100,
            minRadius: 3,
            ease: 0.05
        });

        const textureCube = new TextureCube({
            imagePath: 'textures/cubemap/',
            files: { px: 'px.png', nx: 'nx.png', py: 'py.png', ny: 'ny.png', pz: 'pz.png', nz: 'nz.png' },
            generateMipmaps: false,
        });
        

        this.sphereDS = new DrawSet(new Mesh(new Sphere()), new Program(basicVertex, basicFragment));
        this.sphereDS.setParent(this);
        textureCube.load().then(() => {
            this.sphereDS.program.setTexture('tMap', textureCube);
        });


        this._eventListeners = EventListeners.getInstance();

        this._eventListeners.listen(GL_RESIZE_TOPIC, this.onResize.bind(this));

        this.init();


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
        this.orbit.update();
        this.bolt.setCamera(this._camera);
        super.draw();
    }
}