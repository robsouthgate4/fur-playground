import Utils from '../Utils';


export const generate = async(element, isCustom, debug = false) => {

    const computedStyle = window.getComputedStyle(element);
    
    const font = computedStyle.font;
    const color = computedStyle.color;
    const letterSpacing = computedStyle.letterSpacing;
    const lineHeight = parseFloat(computedStyle.lineHeight.replace('px', ''));
    const rect = element.getBoundingClientRect();
    
    const top = rect.top;
    const left = rect.left;

    const dpr = Math.min(window.devicePixelRatio, 2);
    
    const width = rect.width;
    const height = rect.height;
    const canvas = document.createElement('canvas');
    
    Object.assign(canvas.style, {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
        zIndex: 1000
    });

    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    const ctx = canvas.getContext('2d');

    ctx.scale(dpr, dpr);

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.letterSpacing = letterSpacing;

    // set alpha to 0

    let offsetY = isCustom ? (canvas.height / (2 * dpr)) + 15 : 6;

    ctx.fillText(element.textContent, 0, offsetY);

    debug && document.body.appendChild(canvas);

    // generate webp from canvas
    const webp = await canvas.toDataURL('image/webp', 1.0);
    
    return {
        element,
        webp,
        width,
        height,
        top,
        left
    }

}