export const PBRMatcapVertex = /* glsl */ `

    #version 300 es

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aUv;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 normal;
    uniform mat4 projection;
    uniform vec3 cameraPosition;

    out vec3 Normal;
    out vec3 WorldNormal;
    out vec3 ViewNormal;
    out vec3 Pos;
    out vec3 ViewPosition;
    out vec2 Uv;
    out vec3 WorldPosition;
    out vec3 ViewDirection;
    out mat4 ModelView;
    
    void main() {

        WorldNormal = vec3(model * vec4(aNormal, 0.0)).xyz;
        Normal = aNormal;
        WorldPosition = vec3(model * vec4(aPosition, 1.0));
        ViewPosition = (view * model * vec4(aPosition, 1.0)).xyz;
        ViewDirection = cameraPosition - WorldPosition;
        Uv = aUv;
        ModelView = view * model;
        gl_Position = projection * view * model * vec4(aPosition, 1.0);
        
    }

`;

export const PBRMatcapFragment = /* glsl */ `

    #version 300 es

    precision highp float;

    uniform sampler2D tMRO;
    uniform sampler2D tMatcap;
    uniform sampler2D tNormal;
    uniform sampler2D tRoughness;
    uniform sampler2D tAO;
    uniform sampler2D tAlbedo;
    uniform vec4 lightPosition;
    uniform vec3 lightColor;
    uniform float lightIntensity;
    uniform float normalStrength;
    uniform mat4 view;
    uniform vec3 cameraPosition;

    in vec3 Normal;
    in vec3 WorldNormal;
    in vec3 Pos;
    in vec3 ViewPosition;
    in vec2 Uv;
    in vec3 WorldPosition;
    in vec3 ViewDirection;
    in mat4 ModelView;

    layout(location = 0) out vec4 color;
    layout(location = 1) out vec4 position;
    layout(location = 2) out vec4 normal;
    layout(location = 3) out vec4 extra;

    const float PI = 3.14159265359;
    const float PI2 = 6.28318530718;
    const float RECIPROCAL_PI = 0.31830988618;
    const float RECIPROCAL_PI2 = 0.15915494;
    const float LOG2 = 1.442695;
    const float EPSILON = 1e-6;
    const float LN2 = 0.6931472;

    float prange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
        float oldRange = oldMax - oldMin;
        float newRange = newMax - newMin;
        return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    }

    float pcrange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
        return clamp(prange(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
    }


    vec3 unpackNormal(vec3 eyepos, vec3 surfacenorm, vec3 mapN, float intensity, float scale, vec2 uv) {
        vec3 q0 = dFdx(eyepos.xyz);
        vec3 q1 = dFdy(eyepos.xyz);
        vec2 st0 = dFdx(uv.st);
        vec2 st1 = dFdy(uv.st);

        vec3 N = normalize(surfacenorm);

        vec3 q1perp = cross( q1, N );
        vec3 q0perp = cross( N, q0 );

        vec3 T = q1perp * st0.x + q0perp * st1.x;
        vec3 B = q1perp * st0.y + q0perp * st1.y;

        float det = max( dot( T, T ), dot( B, B ) );
        float scalefactor = ( det == 0.0 ) ? 0.0 : inversesqrt( det );

        mapN = mapN * 2.0 - 1.0;
        mapN.xy *= intensity;

        return normalize( T * ( mapN.x * scalefactor ) + B * ( mapN.y * scalefactor ) + N * mapN.z );
        
    }

    float geometricOcclusion(float NdL, float NdV, float roughness) {
        float r = roughness;
        float attenuationL = 2.0 * NdL / (NdL + sqrt(r * r + (1.0 - r * r) * (NdL * NdL)));
        float attenuationV = 2.0 * NdV / (NdV + sqrt(r * r + (1.0 - r * r) * (NdV * NdV)));
        return attenuationL * attenuationV;
    }

    float microfacetDistribution(float roughness, float NdH) {
        float roughnessSq = roughness * roughness;
        float f = (NdH * roughnessSq - NdH) * NdH + 1.0;
        return roughnessSq / (PI * f * f);
    }
    
    vec2 reflectMatcap(vec3 worldPos, vec3 worldNormal, vec3 viewDir) {
        vec3 viewPos = (view * vec4(worldPos, 1.0)).xyz;
        vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
        vec3 y = cross(viewDir, x);
        vec2 uv = vec2(dot(x, worldNormal), dot(y, worldNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
        return uv;
    }

    void main() {
        vec3 peturbedNormal = unpackNormal(ViewPosition, WorldNormal, texture(tNormal, Uv * 5.).rgb, 0.5, 30.0, Uv);
        vec2 uv = reflectMatcap(WorldPosition, peturbedNormal, normalize(ViewDirection));
        float roughness = texture(tRoughness, Uv * 10.).r;
        vec3 reflection = texture(tMatcap, uv, roughness * 10.0).rgb;

        float ao = texture(tAO, Uv * 5.).r;

        vec3 lightPosition = vec3(0.0, 10.0, -10.0);

        vec4 light = vec4(lightPosition.xyz, 0.6);
        vec3 lightColor = vec3(0.9, 0.8, 0.9);
        vec3 baseColor = vec3(0.1, 0.1, 0.1);

        vec3 V = normalize(cameraPosition - WorldPosition);
        vec3 L = normalize(light.xyz);
        vec3 H = normalize((L + V) / 2.);

        float NdL = pcrange(clamp(dot(peturbedNormal, L), 0.001, 1.0), 0.0, 1.0, 0.4, 1.0);
        float NdV = pcrange(clamp(abs(dot(peturbedNormal, V)), 0.001, 1.0), 0.0, 1.0, 0.4, 1.0);
        float NdH = clamp(dot(peturbedNormal, H), 0.0, 1.0);
        float VdH = clamp(dot(V, H), 0.0, 1.0);

        float G = geometricOcclusion(NdL, NdV, roughness);
        float D = microfacetDistribution(roughness, NdH);

        vec3 specContrib = G * D / (4.0 * NdL * NdV) * lightColor;
        vec3 col = NdL * specContrib * light.w;

        vec3 outColor = ((baseColor * reflection) + col) * pow(ao, 3.0);

        color = vec4(outColor, 1.0);
        position = vec4(WorldPosition, 1.0);
        normal = vec4(peturbedNormal, 1.0);
        extra = vec4(1.0 - (roughness * 0.2), 0.0, 0.0, 1.0);
    }
        
`;
