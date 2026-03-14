import Scene from "../Scene.js";
import Environement from "./Environment.js";
import Layer from "../../Utils/Layer.js";
import GridPlacement from "../../Utils/placement.js";
import listData from "../../../../data/listData.js";
import { lerp, clamp } from "../../Utils/math.js";

const IMAGES_PER_LAYER = 4;
const Z_STEP = -100;

export default class DefaultScene extends Scene {
  init() {
    this.resources = this.experience.resources;
    this.layers = [];

    this.normalizedScroll = 0;
    this.scrollDepth = 0;
    this.scrollDepthTarget = 0;

    if (this.resources.toLoad === this.resources.loaded) {
      this.onResourcesLoaded();
    } else {
      this.resources.on("loaded", () => this.onResourcesLoaded());
    }
  }

  onResourcesLoaded() {
    this.environement = new Environement();

    const viewport = {
      width: this.experience.sizes.width,
      height: this.experience.sizes.height,
    };

    const grid = new GridPlacement(viewport);
    const occupiedCells = new Set();

    const chunks = [];
    for (let i = 0; i < listData.length; i += IMAGES_PER_LAYER) {
      chunks.push(listData.slice(i, i + IMAGES_PER_LAYER));
    }

    this.layers = chunks.map((chunk, layerIndex) => {
      const cellPositions = grid.assignCells(chunk.length, occupiedCells);
      cellPositions.forEach((p) => occupiedCells.add(p.cellIndex));

      const layer = new Layer({
        zDepth: layerIndex * Z_STEP,
        cellPositions,
        maxWidth: 250,
      });

      chunk.forEach((item) => {
        const texture = this.resources.items[`galleryTexture${item.id}`];
        layer.add(texture);
      });

      this.scene.add(layer.group);
      layer.group.position.z = layer.zDepth;
      return layer;
    });

    const allMeshes = this.layers.flatMap((layer) => layer.getMeshes());
    this.experience.interaction.register("default", allMeshes);
  }

  setScrollOffset(sectionOffset, totalSectionHeight) {
    const normalized = clamp(
      sectionOffset / Math.max(totalSectionHeight, 1),
      0,
      1,
    );
    this.normalizedScroll = normalized;

    const cameraZ = this.experience.camera.instance.position.z;
    const minLayerZ = Math.min(...this.layers.map((l) => l.zDepth));
    const MAX_SCROLL_DEPTH = Math.max(1, cameraZ - minLayerZ + 200);
    this.scrollDepthTarget = normalized * MAX_SCROLL_DEPTH;
  }

  update() {
    this.scrollDepth = lerp(this.scrollDepth, this.scrollDepthTarget, 0.12);

    for (const layer of this.layers) {
      layer.updateWithScroll(this.scrollDepth);
    }
  }

  destroy() {
    this.experience.interaction.unregister("default");
    for (const layer of this.layers) {
      layer.dispose();
      this.scene.remove(layer.group);
    }
    this.layers = [];
  }
}
