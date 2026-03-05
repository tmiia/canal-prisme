import * as THREE from "three";
import Scene from "../Scene.js";
import Cube from "./Cube/Cube.js";
import Environement from "./Environment.js";
import Plane from "../Shared/Plane/Plane.js";

export default class DefaultScene extends Scene {
  init() {
    this.resources = this.experience.resources;

    // this.cube = new Cube(new THREE.Vector3(2, 0.5, 0));
    this.plane = new Plane({ width: 100, height: 100, color: "#ffffff" });
    if (this.resources.toLoad === this.resources.loaded) {
      this.onResourcesLoaded();
    } else {
      this.resources.on("loaded", () => this.onResourcesLoaded());
    }
  }

  onResourcesLoaded() {
    this.environement = new Environement();
  }

  update() {
    // if (this.cube) this.cube.update();
    if (this.plane) this.plane.update();
  }
}
