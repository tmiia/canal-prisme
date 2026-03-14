import DefaultScene from "./Default/DefaultScene.js";
import ListScene from "./List/ListScene.js";

export default class SceneManager {
  constructor(experience) {
    this.experience = experience;
    this.debug = this.experience.debug;

    this.sceneInstances = {
      default: null,
      list: null,
    };
    this.currentSceneKey = null;
    this.currentScene = null;

    this._initScenes();

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("SceneManager");
      this.debugFolder.close();
      this.debugObject = { scene: "default" };
      this.debugFolder
        .add(this.debugObject, "scene", ["default", "list"])
        .name("Scene")
        .onChange((value) => this.setScene(value));
    }
  }

  _initScenes() {
    const defaultScene = new DefaultScene();
    defaultScene.init();
    this.sceneInstances.default = defaultScene;

    const listScene = new ListScene();
    listScene.init();
    this.sceneInstances.list = listScene;

    this.setScene("default");
  }

  setScene(key, { resetScroll = false } = {}) {
    const nextScene = this.sceneInstances[key];
    if (!nextScene || key === this.currentSceneKey) return;

    if (resetScroll && key === "default") {
      nextScene.normalizedScroll = 0;
      nextScene.scrollDepth = 0;
      nextScene.scrollDepthTarget = 0;
    }

    this.currentScene = nextScene;
    this.currentSceneKey = key;

    window.dispatchEvent(
      new CustomEvent("scenechange", { detail: { scene: key } })
    );

    if (typeof nextScene.onEnter === "function") {
      nextScene.onEnter();
    }
  }

  update() {
    if (this.currentScene) {
      this.currentScene.update();
    }
  }

  destroy() {
    for (const key in this.sceneInstances) {
      if (this.sceneInstances[key]) {
        this.sceneInstances[key].destroy();
      }
    }
  }
}
