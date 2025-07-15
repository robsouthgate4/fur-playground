export const normalVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    out vec3 Normal;
    out vec2 Uv;
    out vec3 WorldPosition;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    void main() {
        Normal = (model * vec4(aNormal, 0.0)).xyz;
        Uv = aUv;
        WorldPosition = (model * vec4(aPosition, 1.0)).xyz;
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
    }
`

export const normalVertexInstanced = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    
    
    
    in vec3 offset;

    
    out vec3 Normal;
    out vec2 Uv;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;

    void main() {
        Normal = (normal * vec4(aNormal, 0.0)).xyz;
        Uv = Uv;
        vec3 pos = aPosition + offset;
        gl_Position = projection * view * model * vec4(pos, 1.0);
    }
`

export const normalVertexBatched = /* glsl */`

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
`

export const normalFragment = /* glsl */`

    #version 300 es

    precision highp float;

    in vec3 Normal;
    in vec3 WorldPosition;
    in vec2 Uv;

    in vec3 Color;

    uniform float uTime;

    layout(location = 0) out vec4 color;
    layout(location = 1) out vec4 position;
    layout(location = 2) out vec4 normal;
    layout(location = 3) out vec4 extra;

    void main() {
        color = vec4(Normal, 1.0);
        position = vec4(WorldPosition, 1.0);
        normal = vec4(Normal, 1.0);
        extra = vec4(1.0, 0.0, 0.0, 1.0);
    }
`
