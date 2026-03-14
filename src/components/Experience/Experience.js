import Camera from "./Camera";
import Renderer from "./Renderer";
import SceneManager from "./Scenes/SceneManager.js";
import sources from "./sources.js";
import Debug from "./Utils/Debug.js";
import Interaction from "./Utils/Interaction.js";
import Resources from "./Utils/Resources.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";

export default class Experience {
  constructor(canvas, routerReplace) {
    if (Experience.instance) return Experience.instance;
    Experience.instance = this;

    window.experience = this;

    this.routerReplace = routerReplace;
    this.canvas = canvas;

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources, this.data);

    this.flexGroups = new Set();

    this.camera = new Camera();
    this.sceneManager = new SceneManager(this);
    this.renderer = new Renderer();
    this.interaction = new Interaction();

    this.sizes.on("resize", () => this.resize());
    this.time.on("tick", () => this.update());
  }

  registerFlexGroup(group) {
    this.flexGroups.add(group);
  }

  unregisterFlexGroup(group) {
    this.flexGroups.delete(group);
  }

  navigateToPage(path) {
    this.routerReplace(path);
  }

  static resetInstance() {
    if (Experience.instance) {
      Experience.instance.destroy();
      Experience.instance = null;
    }
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.flexGroups.forEach((group) => group.update());
  }

  update() {
    this.sceneManager.update();
    this.camera.update();
    if (this.sceneManager.currentScene) {
      this.renderer.update(this.sceneManager.currentScene.scene);
    }
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    this.sceneManager.destroy();

    if (this.interaction) this.interaction.destroy();
    if (this.renderer.instance) this.renderer.instance.dispose();

    this.flexGroups.clear();

    if (this.debug.active) this.debug.ui.destroy();
  }
}
