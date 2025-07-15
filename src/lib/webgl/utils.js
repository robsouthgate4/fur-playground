import { mat4, vec3, vec4 } from "gl-matrix";

Math.radians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

vec3.unproject = (out, vec, view, projection) => {
  const viewProjection = mat4.create();
  mat4.multiply(viewProjection, projection, view);
  mat4.invert(viewProjection, viewProjection);
  return vec3.transformMat4(out, vec, viewProjection);
};

export const getClassFromString = (name) => `.${name.replace(/_/g, "-")}`;

export const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createPromise = () => {
  const promise = new Promise((resolve, reject) => {
    this.temp_resolve = resolve;
    this.temp_reject = reject;
  });
  promise.resolve = this.temp_resolve;
  promise.reject = this.temp_reject;
  delete this.temp_resolve;
  delete this.temp_reject;
  return promise;
};

export const fit = (value, low1, high1, low2, high2) => {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
};

export const bellCurve = (value) => {
  return (Math.sin(2 * Math.PI * (value - 0.2)) + 1) / 2;
};

export const lerp = (v0, v1, t) => {
  return v0 * (1 - t) + v1 * t;
};

// export const hexToRgb = ( hex ) => {

// 	const result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );

// 	return result
// 		? {
// 			r: parseInt( result[ 1 ], 16 ),
// 			g: parseInt( result[ 2 ], 16 ),
// 			b: parseInt( result[ 3 ], 16 ),
// 		}
// 		: null;

// };

export const strToBool = (s) => {
  const regex = /^\s*(true|1|on)\s*$/i;
  return regex.test(s);
};

export const isIOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isChrome = () => /CriOS/i.test(navigator.userAgent);

export const isFirefoxIOS = () => navigator.userAgent.match("FxiOS");

export const loadAudioBuffer = (url, audioContext) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => {
      audioContext.decodeAudioData(
        request.response,
        function (buffer) {
          resolve(buffer);
        },
        reject
      );
    };

    request.send();
  });
};

export const loadBinaryBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => {
      resolve(request.response);
    };

    request.onerror = (err) => {
      reject(err);
    };

    request.send();
  });
};

export const remapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

export const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export const calcPosFromLatLonRad = (lat, lon, radius) => {
  let phi = (90 - lat) * (Math.PI / 180);

  let theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
};

export const getHeightFromCamera = (camera, dist) => {
  if (!dist) dist = camera.transform.position.length();

  let fov = camera.fov;

  return 2.0 * dist * Math.tan(Math.radians(fov) * 0.5);
};

export const unproject = (camera, vec) => {
  let matrix = mat4.create();
  mat4.multiply(
    matrix,
    camera.view,
    mat4.invert(mat4.create(), camera.projection)
  );
  vec3.transformMat4(vec, vec, matrix);
  return vec;
};

export const domToWebGLCoords = (
  domX,
  domY,
  width,
  height,
  canvasWidth,
  canvasHeight,
  camera
) => {
  // Normalize DOM position and size (flip Y coordinate since DOM Y goes down)
  const normalizedX = (domX / canvasWidth) * 2 - 1;
  const normalizedY = -((domY / canvasHeight) * 2 - 1); // Flip Y axis
  const normalizedWidth = (2 * width) / canvasWidth;
  const normalizedHeight = (2 * height) / canvasHeight;

  // Convert to 3D coordinates
  const ndcCoords = vec4.fromValues(normalizedX, normalizedY, -1.0, 1.0);
  const invViewProjMatrix = mat4.create();
  mat4.multiply(invViewProjMatrix, camera.projection, camera.view);
  mat4.invert(invViewProjMatrix, invViewProjMatrix);

  // Transform to world coordinates
  vec4.transformMat4(ndcCoords, ndcCoords, invViewProjMatrix);

  // Divide by w to convert from homogenous coordinates to 3D space
  const worldCoords = vec3.fromValues(
    ndcCoords[0] / ndcCoords[3],
    ndcCoords[1] / ndcCoords[3],
    ndcCoords[2] / ndcCoords[3]
  );

  // Calculate the size in WebGL units
  const worldWidth = normalizedWidth / camera.projection[0];
  const worldHeight = normalizedHeight / camera.projection[5];

  return {
    position: worldCoords,
    width: worldWidth,
    height: worldHeight,
  };
};
