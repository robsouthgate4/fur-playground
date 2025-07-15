export const grassVertex = /* glsl */`

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
`.trim()

export const grassVertexInstanced = /* glsl */`

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

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    uniform sampler2D tNoise;
    uniform float uTime;

    void main() {
        Normal = aNormal;
        Uv = aUv;
        vec3 pos = (aPosition * aScale) + aOffset;
        vec3 noise = texture(tNoise, (pos.xz * 0.005) - (uTime * 0.01)).rgb * 2.0 - 1.0;
        pos.xz += (noise.xz * 3.0) * pow(Uv.y, 2.5);
        pos.y += noise.y * 0.5;
        Pos = pos;
        Noise = noise;
        gl_Position = projection * view * model * vec4(pos, 1.0);
    }
`.trim()

export const grassVertexBatched = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in mat4 instance;
    out vec3 Normal;
    out vec2 Uv;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    void main() {
        Normal = (normal * vec4(aNormal, 0.0)).xyz;
        Uv = Uv;
        gl_Position = projection * view * instance * vec4(aPosition, 1.0);
    }
`.trim()

export const grassFragment = /* glsl */`

    #version 300 es

    precision highp float;

    out vec4 FragColor;

    in vec3 Normal;
    in vec2 Uv;
    in vec3 Color;
    in vec3 Pos;
    in vec3 Noise;
    uniform float uTime;
    uniform sampler2D tGrass;
    void main() {

        vec4 color = texture(tGrass, Uv);
        color.rgb  = vec3(0.16);
        float noise = length(Noise);
        color.rgb -= (noise * 0.2) * Uv.y;
        color.rgb *= smoothstep(0.0, 1.0, Uv.y);
        if(color.a < 0.5) discard;
        FragColor = color;
    }
`.trim()