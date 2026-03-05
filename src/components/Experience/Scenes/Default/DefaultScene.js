import * as THREE from "three";
import Scene from "../Scene.js";
import Environement from "./Environment.js";
import Plane from "../Shared/Plane/Plane.js";
import FlexGroup from "../../Utils/FlexGroup.js";
import listData from "../../../../data/listData.js";

export default class DefaultScene extends Scene {
  init() {
    this.resources = this.experience.resources;

    if (this.resources.toLoad === this.resources.loaded) {
      this.onResourcesLoaded();
    } else {
      this.resources.on("loaded", () => this.onResourcesLoaded());
    }
  }

  onResourcesLoaded() {
    this.environement = new Environement();

    this.flexGroup = new FlexGroup({
      direction: "row",
      gap: 8,
      align: "flex-start",
      anchor: {
        x: -this.experience.sizes.width / 2,
        y: this.experience.sizes.height / 2,
      }
    });

    this.planes = listData.map((item) => {
      const texture = this.resources.items[`galleryTexture${item.id}`];
      const width = texture.image.width / 6;
      const height = texture.image.height / 6;
      const plane = new Plane({ width, height, texture });
      this.flexGroup.add(plane.mesh);
      return plane;
    });

    this.flexGroup.update();
  }

  update() {}
}
