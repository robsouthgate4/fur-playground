import { Program, Texture2D, LINEAR_MIPMAP_LINEAR, LINEAR, REPEAT } from "bolt-gl";
import { PBRMatcapFragment, PBRMatcapVertex } from "../shaders/PBRMatcap";

export default class FloorProgram extends Program {
    constructor() {
        super(PBRMatcapVertex, PBRMatcapFragment);
        const matcap = new Texture2D({
            imagePath: '/textures/matcap_alley.jpg',
            generateMipmaps: true,
            minFilter: LINEAR_MIPMAP_LINEAR,
            magFilter: LINEAR,
        });
        //TODO: pack these into an RO texture
        const roughness = new Texture2D({
            imagePath: '/textures/floor-rough.webp',
            generateMipmaps: true,
            minFilter: LINEAR_MIPMAP_LINEAR,
            magFilter: LINEAR,
        });
        roughness.wrapS = REPEAT;
        roughness.wrapT = REPEAT;

        const normal = new Texture2D({
            imagePath: '/textures/floor-normal.jpg',
            generateMipmaps: true,
            minFilter: LINEAR_MIPMAP_LINEAR,
            magFilter: LINEAR,
        });
        normal.wrapS = REPEAT;
        normal.wrapT = REPEAT;
        
        const ao = new Texture2D({
            imagePath: '/textures/floor-ao.png',
            generateMipmaps: true,
            minFilter: LINEAR_MIPMAP_LINEAR,
            magFilter: LINEAR,
        });
        ao.wrapS = REPEAT;
        ao.wrapT = REPEAT;
        

        matcap.load().then(() => {
            this.setTexture('tMatcap', matcap);
        });
        roughness.load().then(() => {
            this.setTexture('tRoughness', roughness);
        });
        normal.load().then(() => {
            this.setTexture('tNormal', normal);
        });
        ao.load().then(() => {
            this.setTexture('tAO', ao);
        });
    }
}