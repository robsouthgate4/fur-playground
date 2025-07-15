
export const reflectiveVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    out vec3 Normal;
    out vec2 Uv;
    out vec2 UvMatcap;
    out vec3 EyeVector;
    out vec3 ViewDirection;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform vec3 cameraPosition;
    uniform vec3 color;

    vec2 reflectMatcap(vec3 worldPos, vec3 worldNormal, vec3 viewDir) {
        vec3 viewPos = (view * vec4(worldPos, 1.0)).xyz;
        // In view space, the view direction is simply the negative of the position
        mat4 modelView = model * view;
        vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
        vec3 y = cross(viewDir, x);
        vec2 uv = vec2(dot(x, worldNormal), dot(y, worldNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
        return uv;
    }

    void main() {
        Normal = (model * vec4( aNormal, 0.0 )).xyz;
        Uv = aUv;
        mat4 modelViewMatrix = view * model;
        vec3 worldPos = vec3(model * vec4(aPosition, 1.0));
        ViewDirection = worldPos - cameraPosition;
        UvMatcap = reflectMatcap(worldPos, normalize(Normal), normalize(ViewDirection));
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`.trim()

export const reflectiveFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;
    in vec3 Normal;     
    in vec2 Uv;
    in vec2 UvMatcap;
    in vec3 Color;

    uniform sampler2D tMap;
    uniform sampler2D tMatcap;
    uniform sampler2D tOpacity;
    uniform vec3 color;

    mat2 rotate2d(float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    }

    void main() {
        vec2 uv = rotate2d(0.9) * UvMatcap;
        vec3 matcapColor = texture(tMatcap, uv).rgb;
        float opacity = 1.0;
        if(opacity < 0.1) discard;
        FragColor = vec4(matcapColor * color, 1.0);
    }
`.trim()