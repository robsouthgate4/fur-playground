

export const leavesVertexInstanced = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in vec3 aOffset;
    layout(location = 4) in vec3 aRotation;
    layout(location = 5) in float aSize;
    layout(location = 6) in vec3 aLife;

    out vec3 Normal;
    out vec2 Uv;
    out vec3 Pos;
    out vec3 Life;
    out vec4 ShadowCoord;
    out float Size;
    out vec3 WorldPosition;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform mat4 lightSpaceMatrix;

    uniform sampler2D uLeafTexture;
    uniform float uTime;

    mat3 rotateX(float angle) {
        return mat3(
            1.0, 0.0, 0.0,
            0.0, cos(angle), -sin(angle),
            0.0, sin(angle), cos(angle)
        );
    }

    mat3 rotateY(float angle) {
        return mat3(
            cos(angle), 0.0, sin(angle),
            0.0, 1.0, 0.0,
            -sin(angle), 0.0, cos(angle)
        );
    }

    mat3 rotateZ(float angle) {
        return mat3(
            cos(angle), -sin(angle), 0.0,
            sin(angle), cos(angle), 0.0,
            0.0, 0.0, 1.0
        );
    }


    float parabola( float x, float k ){
        return pow( 4.0*x*(1.0-x), k );
    }

    void main() {
        Normal = aNormal;
        Uv = aUv;
        Life = aLife;
        Size = aSize;
        vec3 localPosition = aPosition;

        float t = Life.x;
        float k = 0.5;
        float y = parabola(t, k);
        
        localPosition *= y;

        localPosition = rotateX(aRotation.x) * localPosition;
        localPosition = rotateY(aRotation.y) * localPosition;
        localPosition = rotateZ(aRotation.z) * localPosition;

        Normal = rotateX(aRotation.x) * Normal;
        Normal = rotateY(aRotation.y) * Normal;
        Normal = rotateZ(aRotation.z) * Normal;

        localPosition *= aSize;



        vec3 pos = (localPosition + aOffset);

        Pos = pos;

        WorldPosition = (model * vec4(Pos, 1.0)).xyz;

        vec4 shadowCoord = lightSpaceMatrix * model * vec4(pos, 1.0);
        ShadowCoord = shadowCoord;

        gl_Position = projection * view * model * vec4(pos, 1.0);
    }
`

export const leavesFragment = /* glsl */`

    #version 300 es

    precision highp float;


    in vec3 Normal;
    in vec2 Uv;
    in vec3 Pos;
    in vec3 Life;
    in float Size;
    in vec4 ShadowCoord;
    in vec3 WorldPosition;

    uniform float uTime;
    uniform sampler2D uLeafTexture;
    uniform sampler2D uLeafTexture2;
    uniform sampler2D shadowMap;

    layout(location = 0) out vec4 color;
    layout(location = 1) out vec4 position;
    layout(location = 2) out vec4 normal;
    layout(location = 3) out vec4 extra;

    float getShadow( vec4 shadowCoord )
    {
        vec3 projCoords = shadowCoord.xyz / shadowCoord.w;

        projCoords = projCoords * 0.5 + 0.5;

        if(projCoords.z < 0.0 || projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0) {
            return 0.0;
        }

        float currentDepth = projCoords.z;

        float bias = 0.0001;
        float shadow = 0.0;
        vec2 texelSize = 1.0 / vec2( textureSize( shadowMap, 0 ) );

        for(int x = -1; x <= 1; ++x)
        {
            for(int y = -1; y <= 1; ++y)
            {
                float pcfDepth = texture( shadowMap, projCoords.xy + vec2( x, y ) * texelSize ).r;
                shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
            }
        }

        shadow /= 9.0;

        return shadow;
    }


    void main() {

        
        vec4 leafA = texture(uLeafTexture, Uv);
        vec4 leafB = texture(uLeafTexture2, Uv);
        vec3 leaf = mix(leafA.rgb, leafB.rgb, Size * 1.5);
        float mask = leaf.r;
        if(mask < 0.5) discard;
        if(Life.x == 0.0 || Life.x > 1.0) discard;

        float shadow = getShadow(ShadowCoord);

        vec3 lightPosition = vec3(0.0, 60.0, 10.0);
        vec3 lightDirection = normalize(lightPosition - Pos);
        float lightIntensity = max(dot(Normal, lightDirection), 0.0);

        vec3 pink = leaf.rgb;
        pink.r *= 1.2;
        leaf.rgb = mix(leaf.rgb, pink, Size);

        leaf.rgb += 0.3;

        leaf.b *= 1.1;

        leaf.rgb -= (0.5 + (0.1 * Size)) * shadow;
        color = vec4(leaf.rgb, 1.0);       
        position = vec4(WorldPosition, 1.0);
        normal = vec4(Normal, 1.0);
        extra = vec4(0.0);
    }
`

export const leavesShadowVertex = /* glsl */`

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;
    layout(location = 3) in vec3 aOffset;
    layout(location = 4) in vec3 aRotation;
    layout(location = 5) in float aSize;
    layout(location = 6) in vec3 aLife;

    out vec3 Normal;
    out vec2 Uv;
    out vec3 Pos;
    out vec3 Life;
    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform mat4 lightSpaceMatrix;
    uniform sampler2D uLeafTexture;
    uniform float uTime;

    mat3 rotateX(float angle) {
        return mat3(
            1.0, 0.0, 0.0,
            0.0, cos(angle), -sin(angle),
            0.0, sin(angle), cos(angle)
        );
    }

    mat3 rotateY(float angle) {
        return mat3(
            cos(angle), 0.0, sin(angle),
            0.0, 1.0, 0.0,
            -sin(angle), 0.0, cos(angle)
        );
    }

    mat3 rotateZ(float angle) {
        return mat3(
            cos(angle), -sin(angle), 0.0,
            sin(angle), cos(angle), 0.0,
            0.0, 0.0, 1.0
        );
    }


    float parabola( float x, float k ){
        return pow( 4.0*x*(1.0-x), k );
    }

    void main() {
        Normal = aNormal;
        Uv = aUv;
        Life = aLife;
        vec3 localPosition = aPosition;

        float t = Life.x;
        float k = 0.5;
        float y = parabola(t, k);
        
        localPosition *= y;

        localPosition = rotateX(aRotation.x) * localPosition;
        localPosition = rotateY(aRotation.y) * localPosition;
        localPosition = rotateZ(aRotation.z) * localPosition;

        localPosition *= aSize;

        vec3 pos = (localPosition + aOffset);
        gl_Position = lightSpaceMatrix * model * vec4(pos, 1.0);
    }
`

export const leavesShadowFragment = /* glsl */`
    #version 300 es

    precision highp float;

    out vec4 FragColor;

    void main() {
        FragColor = vec4( vec3( gl_FragCoord.z ), 1.0 );
    }
`