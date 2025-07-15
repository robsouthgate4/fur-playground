

export const furVertexInstanced = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in vec3 aOffset;
    layout(location = 4) in vec3 aScale;

    
    out vec3 Normal;
    out vec2 Uv;
    out vec3 Pos;
    out vec3 Noise;
    out vec3 Offset;
    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    uniform vec2 uMax;
    uniform vec2 uMin;

    uniform sampler2D tNoise;
    uniform float uTime;
    uniform sampler2D tPattern;
    float cubicIn(float t) {
        return t * t * t;
    }

    void main() {
        Normal = aNormal;
        Uv = aUv;
        vec3 localPos = aPosition;
        vec3 noiseA = texture(tNoise, (aOffset.xz * 0.06    ) - (uTime * 0.01)).rgb * 2.0 - 1.0;
        vec3 noiseB = texture(tNoise, (aOffset.xz * 0.05) + (uTime * 0.01)).rgb * 2.0 - 1.0;
        vec3 noise = min(noiseA, noiseB);
        localPos.z -= (1.3 + (1.0 * (noise.r * 0.5 + 0.5))) * cubicIn(Uv.y);
        localPos.xz += clamp(noise.xz * cubicIn(Uv.y), -0.5, 0.5) * 2.0;
        vec3 pos = (localPos * aScale) + aOffset;
        Pos = pos;
        Offset = aOffset;
        Noise = noise;
        gl_Position = projection * view * model * vec4(pos, 1.0);
    }
`


export const furFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    in vec3 Normal;
    in vec2 Uv;
    in vec3 Color;
    in vec3 Pos;
    in vec3 Offset;
    in vec3 Noise;
    uniform float uTime;
    uniform sampler2D tFur;
    uniform vec2 uMax;
    uniform vec2 uMin;
    uniform sampler2D tPattern;
    void main() {

        vec4 color = texture(tFur, Uv);

        if(color.r < 0.1) discard;

        vec3 lightPosition = vec3(5.0, 10.0, 0.0);
        vec3 lightDirection = normalize(lightPosition - Pos);
        float diffuse = max(dot(Normal, lightDirection), 0.0);

        // mint green
        vec2 patternUV = (Offset.xz - uMin) / (uMax - uMin);
        patternUV.y = 1.0 - patternUV.y;
        vec3 pattern = texture(tPattern, patternUV).rgb;
        vec3 albedo = pattern;
        vec3 col = mix(albedo, mix(albedo, albedo * 1.5, length(Noise) * 0.5 + 0.5), pow(Uv.y, 1.5));
        //col -= diffuse * 0.1;

        col = mix(col, col * 0.8, smoothstep(0.7, 1.0, length(Noise)));
        FragColor = vec4(col, color.r);
    }
`