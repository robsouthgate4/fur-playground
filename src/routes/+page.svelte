
<script>
    import { onMount } from "svelte";
	import { generate } from '../lib/domToWebgl/index.js';
    import Utils from "../lib/Utils.js";

    let titleRef;
    let titleRef2;
    let introRef;

    const webps = [];

    onMount(async () => {
    
        // var myFont = new FontFace('FirstContact', 'url(fonts/first-contact-regular.woff2)');

        // myFont.load().then(async function(font){

        //     // with canvas, if this is ommited won't work
        //     document.fonts.add(font);

        //     const imgs = await Promise.all([
        //         generate(titleRef, true),
        //         generate(introRef, false)
        //     ]);
    
        //     imgs.forEach((img, i) => {
        //         console.log(img);
        //         Utils.cacheWebp(img);
        //     });
        
        // });

    });

</script>

<div class="wrapper">
    <h1 bind:this={titleRef} class="title">Rob southgate</h1>
    <p bind:this={introRef} class="intro">Web Developer</p>
</div>


<style>

    .wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        color: #000000;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 20px;
        background-color: #ebebeb;
        visibility: hidden;
    }


    h1 {
        color: #000000;
        font-size: 13vw;
        text-align: center;
        font-family: 'FirstContact';
        font-weight: 700;
        line-height: 2.3;
    }

    p {
        font-family: sans-serif;
        font-size: 3vw;
        letter-spacing: -0.05em;
        color: #000000;
        font-weight: 100;
        margin-top: 30px;
    }

</style>