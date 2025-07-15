

export const homeSceneVertex  = /* glsl */`

#version 300 es

precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;

out vec2 Uv;

void main() {

	Uv = vec2(0.5) + (aPosition.xy) * 0.5;

	gl_Position = vec4(aPosition.xy, 0.0, 1.0);

}
`;

export const homeSceneFragment = /* glsl */`

	#version 300 es

	precision highp float;
	uniform sampler2D map;
	uniform sampler2D gBufferPositions;
	uniform sampler2D gBufferNormals;
	uniform sampler2D gBufferExtra;
	uniform mat4 view;
	uniform mat4 inverseView;
	uniform mat4 inverseProjection;
	uniform mat4 projection;
	uniform vec2 resolution;
	uniform vec3 cameraPosition;
	in vec2 Uv;
	out vec4 FragColor;

	#define Scale vec3(.8, .8, .8)
	#define K 19.19

	vec3 hash(vec3 a)
	{
		a = fract(a * Scale);
		a += dot(a, a.yxz + K);
		return fract((a.xxy + a.yxx)*a.zyx);
	}

	float getFresnel(vec3 normal, vec3 viewDir, float power) {
        float d = dot(normalize(normal), normalize(viewDir));
        return 1.0 - pow(abs(d), power);
    }

	vec2 worldToScreenUV(vec3 worldPos) {
		vec4 clip = projection * view * vec4(worldPos, 1.0);
		vec3 ndc = clip.xyz / clip.w;
		return ndc.xy * 0.5 + 0.5; // NDC → UV
	}

	vec3 screenUVToWorld(vec2 screenUV) {
		vec4 clip = vec4(screenUV * 2.0 - 1.0, 1.0, 1.0);
		vec4 worldPos = inverseView * inverseProjection * clip;
		return worldPos.xyz / worldPos.w;
	}

	void main() {

		float stepSize = 1.;
		int maxSteps = 30;
		float maxDistance = 30.;
		int binarySearchSteps = 5;
		float thickness = 0.9999;

		vec3 sceneColor = texture(map, Uv).rgb;
		vec3 worldPosition = texture(gBufferPositions, Uv).rgb;
		vec3 worldNormals = texture(gBufferNormals, Uv).rgb;
		vec3 viewNormals = (view * vec4(worldNormals, 0.0)).xyz;
		vec3 extra = texture(gBufferExtra, Uv).rgb;

		float metallic = extra.r;

		if(metallic < 0.01) {
			discard;
		}

		vec3 camToFrag = normalize(worldPosition - cameraPosition);

		vec3 jitter = hash(worldPosition) * 2.0 - 1.0;
		vec3 reflection = reflect(camToFrag, normalize(worldNormals));

		float distanceTravelled = 0.0;
		float prevDistance = 0.0;
		vec4 color = vec4(0.0);
		vec2 coord = Uv;
		float visibility = 1.0;
		float depth = thickness;

		bool hit = false;

		for (int i = 0; i < maxSteps; i++) {
			
			prevDistance = distanceTravelled;

			distanceTravelled += stepSize;

			vec3 rayPosition = worldPosition + reflection * distanceTravelled;

			if (length(rayPosition - worldPosition) > maxDistance) {
				break;
			}

			vec2 uv = worldToScreenUV(rayPosition);

			if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
				break;
			}

			vec3 projectedPosition = texture(gBufferPositions, uv).rgb;

			float projectedDistFromCamera = distance(projectedPosition, cameraPosition);
			float rayDistFromCamera = distance(rayPosition, cameraPosition);

			depth = rayDistFromCamera - projectedDistFromCamera;

			if(depth > 0.0 && depth < thickness) {
				
				coord = worldToScreenUV(rayPosition);
				hit = true;
				break;
			}
			
			
		}

		vec3 reflectionColor = texture(map, coord).rgb;

		//reflectionColor = mix(sceneColor, reflectionColor, smoothstep(0.0, 1.0, 1.0 - coord.y));
		
		vec3 outColor = mix(sceneColor, reflectionColor * getFresnel(normalize(worldNormals), camToFrag, 1.0), metallic);

		if(hit) {
			FragColor = vec4(outColor, 1.0);
		} else {
			FragColor = vec4(sceneColor, 1.0);
		}
	}

`
