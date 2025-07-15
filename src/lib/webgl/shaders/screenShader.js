export const screenVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    out vec3 Normal;
    out vec2 Uv;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    void main() {
        Uv = aPosition.xy * 0.5 + 0.5;
        vec3 pos = aPosition;
        gl_Position = vec4(pos, 1.0);
    }
`.trim()

export const screenFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    uniform sampler2D tMap;
     
    in vec2 Uv;

    void main() {
        vec3 color = texture(tMap, Uv).rgb;
        FragColor = vec4(color, 1.0);
    }
`.trim()
