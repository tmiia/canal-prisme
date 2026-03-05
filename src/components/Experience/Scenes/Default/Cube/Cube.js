import { BoxGeometry, Mesh, ShaderMaterial, Vector3 } from "three";
import Experience from "../../../Experience.js";
import fragmentShader from "./fragmentShader.glsl";
import vertexShader from "./vertexShader.glsl";

export default class Cube {
  constructor(position = new Vector3(0, 0, 0)) {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.debug = this.experience.debug;
    this.position = position;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);

    this.scene.add(this.mesh);

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Cube");
      this.debugFolder.close();

      this.debugFolder
        .add(this.mesh.position, "x")
        .name("positionX")
        .min(-5)
        .max(5)
        .step(0.001);

      this.debugFolder
        .add(this.mesh.position, "y")
        .name("positionY")
        .min(-5)
        .max(5)
        .step(0.001);

      this.debugFolder
        .add(this.mesh.position, "z")
        .name("positionZ")
        .min(-5)
        .max(5)
        .step(0.001);

      this.debugFolder
        .add(this.mesh.rotation, "x")
        .name("rotationX")
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.001);

      this.debugFolder
        .add(this.mesh.rotation, "y")
        .name("rotationY")
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.001);

      this.debugFolder
        .add(this.mesh.rotation, "z")
        .name("rotationZ")
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.001);
    }
  }

  update() {
    // Animation du cube (exemple)
    if (this.mesh) {
      this.mesh.rotation.x += 0.005;
      this.mesh.rotation.y += 0.01;
    }
  }

  destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh) this.scene.remove(this.mesh);
    if (this.debugFolder) this.debug.ui.removeFolder(this.debugFolder);
  }
}