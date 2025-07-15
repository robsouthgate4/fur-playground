

export default class Physics {

    constructor() {}

    async init(instanceMatrices) {

        const Worker = await import('./Physics.worker?worker');
        this.worker = new Worker.default();

        this.worker.postMessage({
            type: 'init',
            instanceMatrices
        })

        this.worker.onmessage = (e) => {
            if(e.data.type === 'update') {
                this.onUpdate && this.onUpdate(e.data.buffer);
            }
        }
    }
}