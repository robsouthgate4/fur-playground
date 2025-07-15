import bpy
import os
import numpy as np
import gzip
import json
import bmesh
import subprocess
from shutil import copyfile
EXPORT_DIR = "/Users/robertsouthgate/Documents/projects/portfolio-2025/static/models/"  # Update this path
COMPRESS_SCRIPT = "/Users/robertsouthgate/Documents/projects/portfolio-2025/static/scripts/CompressAttributes.js"
os.makedirs(EXPORT_DIR, exist_ok=True)

APPLY_TRANSFORMS = True

def export_textures(material, output_dir):
    """Export textures used by a material to the output directory."""
    textures = []
    if material and material.use_nodes:
        for node in material.node_tree.nodes:
            if node.type == 'TEX_IMAGE' and node.image:
                # Get the source texture file path
                source_path = bpy.path.abspath(node.image.filepath)
                if os.path.exists(source_path):
                    # Copy texture to output directory
                    texture_filename = os.path.basename(source_path)
                    texture_dest = os.path.join(output_dir, texture_filename)
                    copyfile(source_path, texture_dest)
                    textures.append(texture_filename)
                else:
                    print(f"Texture file {source_path} not found.")
    return textures

def assign_solid_vertex_colors(obj):
    """Assign solid vertex colors to faces based on materials."""
    mesh = obj.data
    
    # Create a new vertex color layer if it doesn't exist
    if not mesh.vertex_colors:
        mesh.vertex_colors.new(name="Col")
    color_layer = mesh.vertex_colors.active

    # Generate random solid colors for each material
    material_colors = {
        mat.name: (np.random.rand(), np.random.rand(), np.random.rand(), 1.0) for mat in mesh.materials
    }

    # Assign solid colors to each face based on its material
    for poly in mesh.polygons:
        material_index = poly.material_index
        material_name = mesh.materials[material_index].name
        color = material_colors.get(material_name, (1.0, 1.0, 1.0, 1.0))  # Default white
        
        # Assign the same color to all vertices of the face
        for loop_index in poly.loop_indices:
            color_layer.data[loop_index].color = color

    return material_colors

def export_mesh_binary(obj, is_instanced, export_path):
    
    """Export raw mesh data to a custom binary format."""
    mesh = obj.data

    # Create a BMesh from the mesh data
    bm = bmesh.new()
    bm.from_mesh(mesh)

    # Apply transforms if not instanced
    if not is_instanced and APPLY_TRANSFORMS:
        bm.transform(obj.matrix_world)
    
    # Triangulate the mesh to ensure all faces are triangles
    bmesh.ops.triangulate(bm, faces=bm.faces[:])

    # Ensure normals are calculated
    bm.normal_update()

    # Get the active UV layer (if available)
    uv_layer = bm.loops.layers.uv.active if bm.loops.layers.uv else None

    # Get the active vertex colour layer
    color_layer = bm.loops.layers.color.active
    
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    eval_mesh = eval_obj.to_mesh()

    eval_mesh.calc_loop_triangles()
    eval_mesh.calc_normals_split()
    
    # Build unique vertex data to avoid duplicate positions/normals/UVs/colours
    vertex_data = {}
    vertex_list = []
    indices = []
    
    uv_layer_eval = eval_mesh.uv_layers.active.data if eval_mesh.uv_layers.active else None
    color_layer_eval = eval_mesh.vertex_colors.active.data if eval_mesh.vertex_colors.active else None

    def add_vertex(vertex, normal, uv, color):
        key = (tuple(vertex), tuple(normal), tuple(uv) if uv is not None else None, tuple(color))
        if key not in vertex_data:
            vertex_data[key] = len(vertex_list)
            vertex_list.append((vertex, normal, uv, color))
        return vertex_data[key]


    for tri in eval_mesh.loop_triangles:
        for loop_index in tri.loops:
            loop = eval_mesh.loops[loop_index]
            vert = eval_mesh.vertices[loop.vertex_index]
            
            # Position (apply transform if not instanced)
            co = obj.matrix_world @ vert.co if not is_instanced and APPLY_TRANSFORMS else vert.co
            pos = [co.x, co.z, -co.y]  # Y-up

            # Split normal
            no = loop.normal
            norm = [no.x, no.z, -no.y]  # Y-up

            # UV
            uv = uv_layer_eval[loop_index].uv[:] if uv_layer_eval else None

            # Vertex color
            color = color_layer_eval[loop_index].color[:] if color_layer_eval else (1.0, 1.0, 1.0, 1.0)

            index = add_vertex(pos, norm, uv, color)
            indices.append(index)



    # Separate vertex attributes
    positions = np.array([v[0] for v in vertex_list], dtype=np.float32)
    normals = np.array([v[1] for v in vertex_list], dtype=np.float32)
    uvs = np.array([v[2] for v in vertex_list if v[2] is not None], dtype=np.float32) if uv_layer else None
    colors = np.array([v[3] for v in vertex_list], dtype=np.float32)
    indices = np.array(indices, dtype=np.uint16)

    print(len(indices))

    interleaved = np.zeros((len(positions), 12), dtype=np.float32)
    interleaved[:, 0:3] = positions
    interleaved[:, 3:6] = normals
    interleaved[:, 6:8] = uvs
    interleaved[:, 8:12] = colors

    with open(export_path + ".raw", "wb") as f:
        f.write(interleaved.tobytes())

    with open(export_path + ".raw.indices", "wb") as f:
        f.write(indices.tobytes())

    print(f"Exported mesh to {export_path}")

    return positions, normals, uvs, colors, indices

def compress_vertex_buffer(input_path, output_path, stride, mode):
    script_path = "/Users/robertsouthgate/Documents/projects/portfolio-2025/static/scripts/CompressAttributes.js"

    try:
        subprocess.run(
            ["/Users/robertsouthgate/.nvm/versions/node/v16.15.0/bin/node", script_path, input_path, output_path, str(stride), mode],
            check=True
        )

        # new delete the raw file
        os.remove(input_path)
        
        print(f"✅ Compression complete: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Compression failed: {e}")

    # Run the compress script
scene_data = {}
instanced_objects = []
for obj in bpy.context.selected_objects:
    if obj.type != "MESH":
        continue

    # check name contains instanced
    lowercaseName = obj.name.lower()
    is_instanced = "instance" in lowercaseName

    if is_instanced:
        instanced_objects.append(obj)   

    material_colors = assign_solid_vertex_colors(obj)

    textures = []
    if obj.active_material:
        textures = export_textures(obj.active_material, EXPORT_DIR)

    export_path = os.path.join(EXPORT_DIR, f"{obj.name}.bolt")
    export_path_compressed = os.path.join(EXPORT_DIR, f"{obj.name}.vertices.bolt")
    export_path_compressed_indices = os.path.join(EXPORT_DIR, f"{obj.name}.indices.bolt")
    raw_path = os.path.join(EXPORT_DIR, f"{obj.name}.bolt.raw")
    raw_path_indices = os.path.join(EXPORT_DIR, f"{obj.name}.bolt.raw.indices")

    positions, normals, uvs, colors, indices = export_mesh_binary(obj, is_instanced, export_path)

    compress_vertex_buffer(raw_path, export_path_compressed, 48, "vertex")
    compress_vertex_buffer(raw_path_indices, export_path_compressed_indices, 1, "index")

    scene_data[obj.name] = {
        "file_compressed": f"{obj.name}.vertices.bolt",
        "file_compressed_indices": f"{obj.name}.indices.bolt",
        "position": list(obj.location),
        "rotation": list(obj.rotation_euler),
        "scale": list(obj.scale),
        "textures": textures,
        "materialColors": material_colors,
        "isInstanced": is_instanced,
        "decode": {
            "vertexCount": len(positions),
            "indexCount": len(indices),
            "stride": 48,
            "hasUVs": bool(uvs is not None)
        }
    }

# Write scene.json
scene_path = os.path.join(EXPORT_DIR, "scene.json")
with open(scene_path, "w") as f:
    json.dump(scene_data, f, indent=2)
print(f"Exported scene data to {scene_path}")