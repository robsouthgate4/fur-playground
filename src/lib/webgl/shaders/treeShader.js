export const treeVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in vec3 aColor;

    out vec3 Normal;
    out vec2 Uv;
    out vec3 Color;
    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform float uTime;
    out vec3 WorldPosition;
    void main() {


        Normal = (normal * vec4(aNormal, 1.0)).xyz;
        Uv = aUv;
        Color = aColor;
        vec3 pos = aPosition;

        //pos = mix(pos * 0.0, pos, 1.0);

        WorldPosition = (model * vec4(pos, 1.0)).xyz;
        gl_Position = projection * view * model * vec4(pos, 1.0);
    }
`

export const treeFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    in vec3 Normal;
    in vec3 WorldPosition;
    in vec2 Uv;
    in vec3 Color;

    uniform float uTime;

    void main() {
        // dark brown        
        FragColor = vec4(vec3(0.08, 0.05, 0.0) * 0.5, 1.0);
    }
`