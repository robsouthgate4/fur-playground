export const basicVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    out vec3 Normal;
    out vec2 Uv;
    out vec2 UvMatcap;
    out vec3 EyeVector;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform vec3 cameraPosition;

    void main() {
        Uv = aUv;
        Normal = aNormal;
        vec3 worldPosition = vec3(model * vec4(aPosition, 1.0));
        EyeVector = normalize(cameraPosition - worldPosition);
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`

export const basicFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;
    in vec3 Normal;     
    in vec2 Uv;
    in vec3 EyeVector;
    uniform sampler2D tMap;

    void main() {
        vec2 uv = Uv;
        uv.y = 1.0 - uv.y;
        vec3 color = texture(tMap, uv).rgb;
        FragColor = vec4(color, 1.0);
    }
`