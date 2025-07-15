import { mat4 } from 'gl-matrix';
import * as oimo from 'oimo';

console.log('Physics worker loaded', oimo);

const world = new oimo.World({
    timestep: 1 / 60,
    iterations: 8,
    broadphase: 2,
    worldscale: 1,
    info: false,
    random: true,
    gravity: [0, -9.8, 0]
});

const bodies = [];

let buffer;

const ground = world.add({size:[300, 10, 300], pos:[0,-20, 0], density:1 });

self.onmessage = function (e) {

    if(e.data.type === 'init') {
        init(e.data.instanceMatrices);        
    }

    self.postMessage('physics initialized');
}

function init(instanceMatrices) {
    for (let i = 0; i < instanceMatrices.length; i++) {
        const instance = instanceMatrices[i];
        const scale = mat4.getScaling([], instance);
        const position = mat4.getTranslation([], instance);
        const rotation = mat4.getRotation([], instance);

        rotation[0] = rotation[0] * 180 / Math.PI;
        rotation[1] = rotation[1] * 180 / Math.PI;
        rotation[2] = rotation[2] * 180 / Math.PI;

        const body = world.add({
            type: 'box',
            size: [4 * 2, 4 * 2, 4 * 2], 
            pos: position,
            rot: rotation,
            move: true, 
            friction: 0.1,
            restitution: 0.9,
            density:0.3,
        });
        bodies.push(body);
    }

    buffer = new Float32Array(bodies.length * 7);

    world.postLoop = () => {
        bodies.forEach((body, i) => {
            const position = body.getPosition();
            const rotation = body.getQuaternion();
            const q = rotation;
            const pos = position;
            buffer.set([pos.x, pos.y, pos.z, q.x, q.y, q.z, q.w], i * 7);
        });

        self.postMessage({ type: 'update', buffer });
    };

    world.play();
}