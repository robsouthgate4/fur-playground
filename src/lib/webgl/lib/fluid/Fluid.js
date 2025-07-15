import { FBOSim, Bolt, FBO, RGBA, RGBA32f, NEAREST, CLAMP_TO_EDGE, FLOAT } from "bolt-gl";
import { advectionFragment } from "../../shaders/fluid";

export default class Fluid {
    constructor() {
        this.bolt = Bolt.getInstance();
        this.fluidSim = new FBOSim(this.bolt);
        const settings = {
            width: 512,
            height: 512,
            format: RGBA,
            type: FLOAT,
            internalFormat: RGBA32f,
            depth: false,
            stencil: false,
            generateMipmaps: false,
            minFilter: NEAREST, // IMPORTANT!!!
            magFilter: NEAREST,
            wrapS: CLAMP_TO_EDGE,
            wrapT: CLAMP_TO_EDGE,
        }

        this.advection = {
            read: new FBO({
                ...settings,
            }),
            write: new FBO({
                ...settings,
            }),
            requiresSwap: true,
            passName: 'advection',
            shader: advectionFragment,
        }

        this.fluidSim.bindFBOs([
            this.advection
        ])

    }

    update() {
        //this.fluidSim.compute('advection');
    }
}