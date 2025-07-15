import { vec3 } from 'gl-matrix';
import { CameraPersp, CLAMP_TO_EDGE, Cube, DrawSet, EventListeners, FBO, FBOSim, FLOAT, Mesh, NEAREST, Program, RGBA, RGBA32f } from 'bolt-gl';
import Base from './Base';
import FBOSceneComposite from './FBOSceneComposite';
import FurScene from './scenes/FurScene';
import { normalFragment, normalVertex } from './shaders/normalShader';
import Stats from 'stats-gl';
import Fluid from './lib/fluid/Fluid';
import Global from './Global';
import ReflectionScene from './scenes/ReflectionScene';


export default class App extends Base {
    constructor(bolt) {
        super();
        this.bolt = bolt;
        window.bolt = this.bolt;
        this.init();
    }

    async init() {

        this.canvas = this.bolt._gl.canvas;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.eventListeners = EventListeners.getInstance();
		this.eventListeners.setBoundElement( this.canvas );

        this.camera = new CameraPersp( {
            aspect: this.canvas.width / this.canvas.height,
            fov: 45,
            far: 1000,
            position: vec3.fromValues( 0, 0, 5 ),
            target: vec3.fromValues( 0, 0, 0 ),
        } );

        this.bolt.setCamera( this.camera );
        this.bolt.resizeCanvasToDisplay();
		this.bolt.enableDepth();

    
        this._cube = new DrawSet(
            new Mesh(new Cube()),
            new Program(normalVertex, normalFragment)
        );

        //this.homeScene = new HomeScene();


        this.furScene = new FurScene();

        this.sceneComposite = new FBOSceneComposite({
			scenes: [this.furScene]
		});

        this.sceneComposite.program.setTexture('tDepth', this.furScene.fbo.depthTexture);

        this.stats = new Stats({
            trackGPU: true,
            trackHz: true,
            trackCPT: true,
            logsPerSecond: 4,
            graphsPerSecond: 30,
            samplesLog: 40, 
            samplesGraph: 10, 
            precision: 2, 
            horizontal: true,
            minimal: false, 
            mode: 0 
        });

       // this.fluid = new Fluid();

        Global.isMobile = window.innerWidth < 768;
        
        // append the stats container to the body of the document
        document.body.appendChild( this.stats.dom );

    
    }

    resize() {
        this.bolt.resizeCanvasToDisplay();
        this.sceneComposite.resize(this.canvas.width, this.canvas.height);
	}

	earlyUpdate( elapsed, delta ) {

		return;

	}

	async update( elapsed, delta ) {  

        this.stats.begin();

        this.furScene.draw({elapsed, delta});        
		this.sceneComposite.draw({elapsed, delta});

        this.stats.end();
        this.stats.update();
		

	}

	lateUpdate( elapsed, delta ) {

		return;

	}

}   