export const backgroundVertex = /* glsl */`

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
        Normal = (normal * vec4(aNormal, 1.0)).xyz;
        Uv = aUv;
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`.trim()

export const backgroundFragment = /* glsl */`

    #version 300 es

    precision highp float;


    in vec3 Normal;
     
    in vec2 Uv;

    in vec3 Color;

    uniform float uTime;

    layout(location = 0) out vec4 color;
    layout(location = 1) out vec4 position;
    layout(location = 2) out vec4 normal;
    layout(location = 3) out vec4 extra;

    void main() {
        color = vec4(vec3(0.0), 1.0);
        position = vec4(0.0);
        normal = vec4(0.0);
        extra = vec4(0.0);
    }
`.trim()
