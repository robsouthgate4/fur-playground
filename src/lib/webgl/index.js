import App from './App';
import { Bolt } from 'bolt-gl';

export const init = async(element) => {

    const bolt = Bolt.getInstance();

    bolt.init(element, {
        alpha: true,
        antialias: false,
        dpi: Math.min(window.devicePixelRatio, 2),
        powerPreference: "high-performance",
    })

    const app = new App(bolt);
    app.start();

    window.addEventListener('resize', () => {
        app.resize();
    });

}