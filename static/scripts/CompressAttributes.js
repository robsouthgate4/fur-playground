import fs from "fs";
import { MeshoptEncoder } from "meshoptimizer";

console.log("🔧 CompressAttributes running with args:", process.argv.slice(2));
const encode = MeshoptEncoder;

(async () => {
  await MeshoptEncoder.ready;
  await encode.ready;
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  const stride = parseInt(process.argv[4], 10);
  const mode = process.argv[5];
  if (mode === "vertex") {
    compressVertexBuffer(inputPath, outputPath, stride);
  } else if (mode === "index") {
    compressIndexBuffer(inputPath, outputPath);
  }
})();

function compressVertexBuffer(inputPath, outputPath, stride) {
  const input = fs.readFileSync(inputPath);
  const vertexBuffer = new Uint8Array(input);
  const vertexCount = vertexBuffer.byteLength / stride;
  const compressed = encode.encodeVertexBuffer(vertexBuffer, vertexCount, stride);
  fs.writeFileSync(outputPath, Buffer.from(compressed));
  console.log(`✅ Compressed ${vertexCount} vertices → ${compressed.length} bytes`);
}

function compressIndexBuffer(inputPath, outputPath) {
  const input = fs.readFileSync(inputPath);
  const indexBuffer = new Uint8Array(input);
  const indexCount = indexBuffer.byteLength / 2;
  const compressed = encode.encodeIndexBuffer(indexBuffer, indexCount, 2);
  fs.writeFileSync(outputPath, Buffer.from(compressed));
  console.log(`✅ Compressed ${indexCount} indices → ${compressed.length} bytes`);
}

