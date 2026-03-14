import { PlaneGeometry, Mesh, MeshBasicMaterial } from "three";

export default class Plane {
  constructor({
    width = 100,
    height = 100,
    color = "#ffffff",
    texture = null,
    parentScene = null,
  } = {}) {
    this.parentScene = parentScene;
    this.width = width;
    this.height = height;

    const opts = {
      transparent: true,
      opacity: 1,
      depthWrite: false,
    };

    if (texture) {
      opts.map = texture;
    } else {
      opts.color = color;
    }

    this.geometry = new PlaneGeometry(this.width, this.height);
    this.material = new MeshBasicMaterial(opts);
    this.mesh = new Mesh(this.geometry, this.material);

    if (this.parentScene) {
      this.parentScene.add(this.mesh);
    }
  }

  destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh && this.parentScene) {
      this.parentScene.remove(this.mesh);
    }
  }
}
