export const colorVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    out vec3 Normal;
    out vec2 Uv;
    out vec3 WorldPosition;
    out vec3 WorldNormal;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    void main() {
        Normal = aNormal;
        WorldPosition = vec3(model * vec4(aPosition, 1.0));
        WorldNormal = vec3(model * vec4(aNormal, 0.0));
        Uv = aUv;
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`.trim()

export const colorFragment = /* glsl */`

    #version 300 es

    precision highp float;

    in vec3 Normal;
    in vec3 WorldPosition;
    in vec3 WorldNormal;
    in vec2 Uv;
    in vec3 Color;

    uniform float uTime;
    uniform vec3 uColor;

    layout(location = 0) out vec4 color;
    layout(location = 1) out vec4 position;
    layout(location = 2) out vec4 normal;
    layout(location = 3) out vec4 extra;

    void main() {
        //FragColor = vec4(Normal * 0.5 + 0.5, 1.0);
        color = vec4(uColor, 1.0);
        position = vec4(WorldPosition, 1.0);
        normal = vec4(WorldNormal, 1.0);
        extra = vec4(0.0, 0.0, 0.0, 1.0);
    }
`.trim()
