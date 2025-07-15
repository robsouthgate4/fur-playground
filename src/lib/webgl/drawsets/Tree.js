import { DrawSet, Mesh, Program, Sphere } from "bolt-gl";
import { normalFragment, normalVertex } from "../shaders/normalShader";
import { vec3 } from "gl-matrix";


export default class Tree extends DrawSet {
    constructor(mesh, program) {
        super(mesh, program);
    }
}