import { PlaneGeometry, Mesh, MeshBasicMaterial } from "three";
import Experience from "../../../Experience";

export default class Plane {
  constructor({ width = 100, height = 100, color = "#ffffff", texture = null } = {}) {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.width = width;
    this.height = height;

    this.setGeometry();
    this.setMaterial(color, texture);
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new PlaneGeometry(this.width, this.height);
  }

  setMaterial(color, texture) {
    const opts = {};
    if (texture) {
      opts.map = texture;
    } else {
      opts.color = color;
    }
    this.material = new MeshBasicMaterial(opts);
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  update() {
    if (this.mesh) {
      this.mesh.rotation.z += 0.005;
    }
  }

  destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh) this.scene.remove(this.mesh);
  }
}
