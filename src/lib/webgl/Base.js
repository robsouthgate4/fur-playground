
import Stats from "stats.js";

import { glSettings } from "./constants";

const { DEBUG_FPS } = glSettings;

export default class Base {

	constructor() {

		this.now = Date.now();

		this.delta = 0;
		this.lastTime = ( new Date() ).getTime(),
		this.currentTime = 0,
		this.delta = 0;

		if ( DEBUG_FPS ) {

			this.stats = new Stats();
			this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
			document.body.appendChild( this.stats.dom );

		}

		document.addEventListener( "visibilitychange", () => {

			document.visibilityState === "visible" ? this.start() : this.pause();

		} );

	}

	start() {

		this.isRunning = true;
		this.run( 0 );

	}

	destroy() {

		if ( this.requestFrame ) {

			cancelAnimationFrame( this.requestFrame );
			this.requestFrame = undefined;

		}

	}


	pause() {

		if ( this.requestFrame ) {

			cancelAnimationFrame( this.requestFrame );
			this.requestFrame = undefined;

		}

		this.isRunning = false;

	}

	earlyUpdate( elapsed, delta ){}

	update( elapsed, delta ){}

	lateUpdate( elapsed, delta ){}

	run( timestamp ) {

		const { DEBUG_FPS } = glSettings;

		if ( DEBUG_FPS ) this.stats?.begin();

		this.elapsed = timestamp * 0.001;
		this.delta = this.elapsed - this.lastTime;
		this.lastTime = this.elapsed;

		this.earlyUpdate( this.elapsed, this.delta );
		this.update( this.elapsed, this.delta );
		this.lateUpdate( this.elapsed, this.delta );

		if ( DEBUG_FPS ) this.stats?.end();

		if ( this.isRunning ) {

			this.requestFrame = requestAnimationFrame( this.run.bind( this ) );

		}

	}

}
