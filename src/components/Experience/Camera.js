import * as THREE from "three";
import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      150,
      this.sizes.width / this.sizes.height,
      1,
      2000,
    );
    this.instance.position.set(0, 0, 600);
    this.instance.lookAt(0, 0, 0);
  }

  /**
   * Returns visible world dimensions at a given z plane for the current camera.
   */
  getVisibleSize(z = 0) {
    const distance = Math.abs(this.instance.position.z - z);
    const fovRad = (this.instance.fov * Math.PI) / 180;
    const height = 2 * distance * Math.tan(fovRad / 2);
    const width = height * this.instance.aspect;
    return { width, height };
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    const key = this.experience.sceneManager?.currentSceneKey;

    let targetZ = this.instance.position.z;
    if (key === "default") {
      targetZ = 100;
    } else if (key === "list") {
      targetZ = 400;
    }

    this.instance.position.z += (targetZ - this.instance.position.z) * 0.05;
    this.instance.lookAt(0, 0, 0);
  }
}
