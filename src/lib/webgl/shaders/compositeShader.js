export const compositeVertex = /*glsl*/ `

    #version 300 es

    precision highp float;

    layout(location = 0) in vec3 aPosition;

    out vec2 Uv;

    void main() {

        Uv = aPosition.xy * 0.5 + 0.5;
        gl_Position = vec4( aPosition, 1.0 );

    }

`;

export const compositeFragment = /*glsl*/ `

    #version 300 es

    precision highp float;

    in vec2 Uv;

    out vec4 FragColor;

    uniform sampler2D tMap1;
    uniform sampler2D tPostMap1;
    uniform sampler2D tDepth;
    uniform sampler2D tNoise;

    uniform float time;

    uniform mat4 projection;
    uniform mat4 projectionInverse;
    uniform mat4 view;
    uniform mat4 viewInverse;

    uniform vec3 cameraPosition;
    uniform vec2 resolution;

    uniform vec3 light1Position;
    uniform vec3 light2Position;
    uniform vec3 light3Position;
    uniform vec3 light1Color;
    uniform vec3 light2Color;
    uniform vec3 light3Color;
    #define RayleighAtt 1.
    #define MieAtt 1.2
    #define DistanceAtt 1e-5

    #define Rayleigh 1.0
    #define Mie 1.0


    float linearizeDepth( float depth, float near, float far ) {
        return ( 2.0 * near ) / ( far + near - depth * ( far - near ) );
    }

    vec3 worldPositionFromDepth(float depth) {
        // Get normalized device coordinates (NDC)
        vec4 ndc = vec4(Uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        
        // Transform back to view space
        vec4 viewSpace = projectionInverse * ndc;
        
        // Perform perspective division to get the actual view space position
        viewSpace.xyz /= viewSpace.w;
        
        // Transform to world space
        vec4 worldSpace = viewInverse * vec4(viewSpace.xyz, 1.0);

        // linearize depth
        //worldSpace.z = linearizeDepth(worldSpace.z, 0.1, 500.0);
        
        return worldSpace.xyz;
    }



    vec3 ACESFilm( vec3 x )
    {
        float tA = 2.51;
        float tB = 0.03;
        float tC = 2.43;
        float tD = 0.59;
        float tE = 0.14;
        return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),0.0,1.0);
    }

    vec3 uncharted2Tonemap(vec3 x) {
        float A = 0.15;
        float B = 0.50;
        float C = 0.10;
        float D = 0.20;
        float E = 0.02;
        float F = 0.30;
        return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
    }

    float sdCone( vec3 p, vec2 c, float h )
    {
        float q = length(p.xz);
        return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
    }

    float sdSphere( vec3 p, float r ) {
        return length(p) - r;
    }

    vec3 scatter(
        vec3 worldPosition, vec3 lightWorldPosition, vec3 lightDirection, float scatterSize, float scatterFalloff, vec3 gradientA, vec3 gradientB) {

        vec3 lightToPoint = normalize(lightWorldPosition - worldPosition);

        vec3 dir = worldPosition - cameraPosition;

        vec3 q = cameraPosition - lightWorldPosition;

        float b = dot(normalize(dir), q);

        float c = dot(q, q) + (scatterSize * scatterSize);

        float s = 1.0 / sqrt(c - b*b);
        float l = s * (atan( (length(dir) + b) * s) - atan( b*s ));

        // Calculate scatter intensity
        float intensity = pow(max(0.0, l * scatterSize), 1.0 / scatterFalloff);
        
        // Lerp between gradient colors based on intensity
        vec3 outCol = vec3(l);

        outCol = ACESFilm(outCol);
        
        outCol *= mix(gradientA, gradientB, intensity);

        return outCol;
    }

    vec3 scatterSmall(
        vec3 worldPosition, vec3 lightWorldPosition, vec3 lightDirection, float scatterSize, float scatterFalloff, vec3 gradientA, vec3 gradientB) {

        vec3 lightToPoint = normalize(lightWorldPosition - worldPosition);

        vec3 dir = worldPosition - cameraPosition;

        vec3 q = cameraPosition - lightWorldPosition;

        float b = dot(normalize(dir), q);

        float c = dot(q, q);

        float s = 1.0 / sqrt(c - b*b);
        float l = s * (atan( (length(dir) + b) * s) - atan( b*s ));

        // Calculate scatter intensity
        float intensity = pow(max(0.0, l * scatterSize), 1.0 / scatterFalloff);

        l *= intensity;
        
        // Lerp between gradient colors based on intensity
        vec3 outCol = vec3(l);

        outCol = ACESFilm(outCol);
        
        outCol *= mix(gradientA, gradientB, intensity);

        return outCol;
    }

    float dither(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 unreal(vec3 x) {
        return x / (x + 0.155) * 1.019;
    }

    float vignette(vec2 uv, float radius) {
        return 1.0 - smoothstep(radius, radius + 0.4, length(uv - vec2(0.5)));
    }

    vec3 filmic(vec3 x) {
        vec3 X = max(vec3(0.0), x - 0.004);
        vec3 result = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);
        return pow(result, vec3(2.2));
    }

    vec3 rgb2hsb( in vec3 c ){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz),
                    vec4(c.gb, K.xy),
                    step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r),
                    vec4(c.r, p.yzx),
                    step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                    d / (q.x + e),
                    q.x);
    }

    vec3 hsb2rgb( in vec3 c ){
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                6.0)-3.0)-1.0,
                        0.0,
                        1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
    }

    void main() {

        vec3 worldPos = worldPositionFromDepth( texture( tDepth, Uv ).r );

        vec3 scene1 = texture( tMap1, Uv ).rgb;

        vec3 light1 = scatterSmall(worldPos, light1Position, vec3(0.0, 1.0, 0.0), 100.0, 1.0, light1Color, light1Color);
        vec3 light2 = scatter(worldPos, light2Position, vec3(0.0, 1.0, 0.0), 50.0, 1.0, light2Color, light2Color);
        vec3 light3 = scatter(worldPos, light3Position, vec3(0.0, 1.0, 0.0), 1.0, 5.0, light3Color, light3Color);
        FragColor.rgb = scene1 + (light3 + light2 + light1);

        vec3 postCol = texture( tPostMap1, Uv ).rgb;

        FragColor.rgb = FragColor.rgb + postCol;

        FragColor.rgb += dither(Uv + fract(time * 100.0)) * 0.015;

        //FragColor.rgb *= vignette(Uv, 0.4);

        FragColor.a = 1.0;
    }

`;
