export const textVertex = /* glsl */`

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

export const textFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    in vec3 Normal;
     
    in vec2 Uv;

    in vec3 Color;

    uniform sampler2D tMap;

    void main() {

        vec4 color = texture(tMap, Uv);
        FragColor = color;
    }
`.trim()
