import * as THREE from "three";
import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.canvas = this.experience.canvas;

    this.setInstance();
  }

  setInstance() {
    const halfW = this.sizes.width / 2;
    const halfH = this.sizes.height / 2;

    this.instance = new THREE.OrthographicCamera(
      -halfW, halfW,
      halfH, -halfH,
      0.1, 2000
    );
    this.instance.position.set(0, 0, 1000);
    this.instance.lookAt(0, 0, 0);
  }

  /** 1 world unit = 1 CSS pixel (identity mapping) */
  toWorld(px) {
    return px;
  }

  toPixels(units) {
    return units;
  }

  /**
   * Maps a DOM element's bounding rect into Three.js world coordinates.
   * Returns { x, y, width, height } where (x, y) is the element's center.
   */
  getWorldPosition(domElement) {
    const rect = domElement.getBoundingClientRect();
    const vw = this.sizes.width;
    const vh = this.sizes.height;

    return {
      x: -vw / 2 + rect.left + rect.width / 2,
      y: vh / 2 - rect.top - rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  }

  resize() {
    const halfW = this.sizes.width / 2;
    const halfH = this.sizes.height / 2;

    this.instance.left = -halfW;
    this.instance.right = halfW;
    this.instance.top = halfH;
    this.instance.bottom = -halfH;
    this.instance.updateProjectionMatrix();
  }

  update() {}
}
