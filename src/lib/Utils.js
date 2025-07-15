import { Texture2D } from "bolt-gl";
import { mat4, quat, vec3 } from "gl-matrix";


export default class Utils {

    static webpCache = [];
    static totalAssets = 0;
    static totalAssetsLoaded = 0;
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static async cacheWebp(value) {
        this.totalAssets++;

        const texture = new Texture2D({
            imagePath: value.webp
        });

        await texture.load();

        value.texture = texture;

        Utils.webpCache.push(value);
        Utils.onCached && Utils.onCached();

        this.totalAssetsLoaded++;

        if(this.totalAssetsLoaded === this.totalAssets) {
            this.onAllCached && this.onAllCached(Utils.webpCache);
        }
    }

    static extractTransformFromGeo(mesh) {
        const matrix = mat4.create();
        const positions = mesh.defaultBuffers.positions;
        const newPositions = new Float32Array(positions.length);
        if(positions) {
            const stride = 3;
            for(let i = 0; i < positions.length; i++) {
                const index = i * stride;
                const x = positions[index];
                const y = positions[index + 1];
                const z = positions[index + 2];
                const transformed = vec3.transformMat4(vec3.create(), vec3.fromValues(x, y, z), matrix);
                newPositions[index] = transformed[0];
                newPositions[index + 1] = transformed[1];
                newPositions[index + 2] = transformed[2];
            }
            mesh.setAttribute(newPositions, 3, 'aPosition');
        }
    }

}