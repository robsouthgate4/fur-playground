export const lightVertex = /* glsl */`

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

    out float D;
    out vec3 ViewNormal;
    out vec3 ViewPosition;
    out vec3 ViewDirection;

    float remap(float value, float min, float max){
        return (value - min) / (max - min);
    }

    void main() {
        // Transform the vertex normal to view space
        mat4 modelViewMatrix = view * model;

        ViewNormal = normalize(view * vec4(aNormal, 0.0)).xyz;

        vec3 viewPosition = (modelViewMatrix * vec4(aPosition, 1.0)).xyz;

        ViewDirection = -vec3(modelViewMatrix * vec4(aPosition, 1.0));

        D = (aPosition.y / 30.0);
        Uv = aUv;
        gl_Position = projection * view * vec4(aPosition, 1.0);
    }
`.trim()

export const lightFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;
    in vec3 Normal;     
    in vec2 Uv;
    in float D;
    in vec3 ViewDirection;
    in vec3 ViewNormal;
    uniform sampler2D tMap;
    uniform sampler2D tOpacity;
    uniform float time;


    float getFresnel(vec3 normal, vec3 viewDir, float power) {
        float d = dot(normalize(normal), normalize(viewDir));
        return 1.0 - pow(abs(d), power);
    }

    float dither(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec3 norm = vec3(ViewNormal.x, ViewNormal.y, ViewNormal.z);
        float fresnel = 1.0 - getFresnel(norm, ViewDirection, 6.0);
        float fresnel2 = 1.0 - getFresnel(norm, ViewDirection, 6.0);
        vec3 colorA = vec3(1.0, 1.0, 1.0) * 4.0;
        vec3 colorB = vec3(0.8, 0.5, 0.3) * 4.0;
        vec3 color = mix(colorA, colorB, 1.0 - pow(D, 2.0));
        FragColor = vec4(color * (fresnel * D), 1.0);
        FragColor.rgb += dither(Uv) * 0.004;
    }
`.trim()