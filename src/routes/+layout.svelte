
<svelte:head>
	<title>Bolt Sveltekit</title>
	<meta name="description" content="Bolt webgl example app built with Svelte" />
</svelte:head>

<script>
    import '../app.css'

    import { onMount } from 'svelte';
	import { init } from '../lib/webgl/index.js';
	import PasswordGate from './password/PasswordGate.svelte';
    let el;

	onMount(() => {
		init(el);
	});



Promise.create = function() {
    const promise = new Promise((resolve, reject) => {
        this.temp_resolve = resolve;
        this.temp_reject = reject;
    });
    promise.resolve = this.temp_resolve;
    promise.reject = this.temp_reject;
    delete this.temp_resolve;
    delete this.temp_reject;
    return promise;
};


</script>

<div class="container">

	<PasswordGate />

	<canvas bind:this={el}></canvas>

	<slot></slot>

</div>

<style>

	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 0;
		margin: 0;
		padding: 20px;
	}

	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

    .nav {
		display: flex;
	}
	
	.nav a {
		display: block;
		font-size: 1.2rem;
		color: #d2d2d2;
		text-decoration: none;
		text-transform: uppercase;
		padding: 5px;
		z-index: 100;
	}

</style>