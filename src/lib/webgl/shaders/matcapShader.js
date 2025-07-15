export const matcapVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in mat4 instance;

    out vec3 Normal;
    out vec2 Uv;
    out vec2 UvMatcap;
    out vec3 EyeVector;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform vec3 cameraPosition;

    vec2 matcapSampler(vec3 worldPos, vec3 worldNormal) {
        vec3 viewDir = normalize(cameraPosition - worldPos);
        vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
        vec3 y = cross(viewDir, x);
        vec2 uv = vec2(dot(x, worldNormal), dot(y, worldNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
        return uv;
    }

    void main() {
        Normal = (instance * vec4( aNormal, 0.0 )).xyz;
        Uv = aUv;
        EyeVector = normalize(cameraPosition - aPosition);
        UvMatcap = matcapSampler(vec3(instance * vec4(aPosition, 1.0)), normalize(mat3(instance) * aNormal));
        gl_Position = projection * view * instance * vec4(aPosition, 1.0);
    }
`.trim()

export const matcapFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;
    in vec3 Normal;     
    in vec2 Uv;
    in vec2 UvMatcap;
    in vec3 Color;
    in vec3 EyeVector;

    uniform sampler2D tMap;
    uniform sampler2D tPosition;
    uniform float uTime;
    uniform vec2 resolution;
    uniform int isBackFace;

    void main() {
        vec3 reflectionColor = texture(tMap, UvMatcap).rgb;
        FragColor = vec4(reflectionColor, 1.0);
    }
`.trim()
