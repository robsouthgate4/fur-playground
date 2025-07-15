
export const doorVertex = /* glsl */`

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
        Normal = aNormal;
        Uv = aUv;
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`;

export const doorFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    #pragma STENCIL {
        ref: 1
        writeMask: 0xFF
        func: ALWAYS
        pass: KEEP
        fail: KEEP
        zFail: KEEP
    }

    #pragma CULL {
        mode: none
    }

    #pragma BLEND {
        src: srcAlpha
        dst: oneMinusSrcAlpha
    }

    void main() {
        FragColor = vec4(1.0);
    }
    
`
