import * as THREE from "three";
import Experience from "../Experience.js";

export default class Scene {
  constructor() {
    this.experience = new Experience();
    console.log(this.experience);

    this.scene = new THREE.Scene();

    this.scene.add(this.experience.camera.instance);
  }

  init() {}
  update() {}
  destroy() {
    this.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
