import Camera from "./Camera";
import Renderer from "./Renderer";
import SceneManager from "./Scenes/SceneManager.js";
import DefaultScene from "./Scenes/Default/DefaultScene.js";
import sources from "./sources.js";
import Debug from "./Utils/Debug.js";
import Resources from "./Utils/Resources.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";

export default class Experience {
  constructor(canvas, routerReplace) {
    if (Experience.instance) return Experience.instance;
    Experience.instance = this;

    // Global access
    window.experience = this;

    this.routerReplace = routerReplace;
    this.canvas = canvas;

    // Setup

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources, this.data);

    this.camera = new Camera();
    this.sceneManager = new SceneManager(this);
    this.sceneManager.setScene(DefaultScene);
    console.log(this.sceneManager);
    this.renderer = new Renderer();

    // Shared props
    this.isGalleryAnimated = true;

    // Resize
    this.sizes.on("resize", () => this.resize());

    // Tick
    this.time.on("tick", () => this.update());
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
  }

  update() {
    this.sceneManager.update();
    this.camera.update();
    this.renderer.update(this.sceneManager.currentScene.scene);
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    if (this.sceneManager.currentScene) {
      this.sceneManager.currentScene.destroy();
    }

    if (this.camera.controls) this.camera.controls.dispose();
    if (this.renderer.instance) this.renderer.instance.dispose();

    if (this.debug.active) this.debug.ui.destroy();
  }
}