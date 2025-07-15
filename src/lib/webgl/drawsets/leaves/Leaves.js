import { Plane, Program, Texture2D, Node, DrawSet, Mesh, InstancedMesh, NONE } from "bolt-gl";
import { leavesVertexInstanced, leavesFragment, leavesShadowVertex, leavesShadowFragment } from "./leavesShader";
import VFX from "../../lib/VFX/VFX";
import Global from "../../Global";
export default class Leaves extends Node {
    constructor({points}) {

        const particleGeometry = new Plane();   
        const particleProgram = new Program(leavesVertexInstanced, leavesFragment);
        particleProgram.cullFace = NONE;

        console.log(Global.shadowFBO);

        particleProgram.setTexture('shadowMap', Global.shadowFBO.depthTexture);


        const leafTexture = new Texture2D({
            imagePath: '/textures/leaf.png'
        });

        const leaf2Texture = new Texture2D({
            imagePath: '/textures/leaf2.png'
        });

        leafTexture.load().then(() => {
            particleProgram.setTexture('uLeafTexture', leafTexture);
        })

        leaf2Texture.load().then(() => {
            particleProgram.setTexture('uLeafTexture2', leaf2Texture);
        })

        super();

        this.particles = new VFX(particleGeometry, particleProgram, points);
        this.particles.drawSet.setParent(this);
    }

    update(elapsed, delta) {
        this.particles.compute(elapsed, delta);
    }
}