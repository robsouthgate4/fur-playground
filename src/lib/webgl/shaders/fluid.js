export const fluidVertex = /*glsl*/ `
    
    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;

    out vec2 Uv;

    void main() {

        Uv = aPosition.xy * 0.5 + 0.5;
        gl_Position = vec4( aPosition, 1.0 );

    }

`;

export const advectionFragment = /*glsl*/ `
    
    #version 300 es

    precision highp float;

    in vec2 Uv;
    uniform sampler2D map;

    out vec4 FragColor;

    void main() {
        vec2 pos = Uv;
        vec4 col = texture(map, pos);
        col.rgb += vec3(0.001, 0.0, 0.0);
        col.a = 1.0;
        FragColor = col;
    }

//     void advect(float2 coords
//             : WPOS,
//               // grid coordinates
//               out float4 xNew
//             : COLOR,
//               // advected qty
//               uniform float timestep, uniform float rdx,
//               // 1 / grid scale
//               uniform samplerRECT u,
//               // input velocity
//               uniform samplerRECT x)
// // qty to advect
// {
//   // follow the velocity field "back in time"
//   float2 pos = coords - timestep * rdx * f2texRECT(u, coords);
//   // interpolate and write to the output fragment
//   xNew = f4texRECTbilerp(x, pos);
// }
    
`;