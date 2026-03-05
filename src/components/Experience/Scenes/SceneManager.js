import DefaultScene from "./Default/DefaultScene.js";

export default class SceneManager {
  constructor(experience) {
    this.experience = experience;
    this.resources = this.experience.resources;
    this.currentScene = null;
    this.debug = this.experience.debug;

    this.scenes = {
      default: DefaultScene,
    };

    console.log(this.scenes);

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("SceneManager");
      this.debugFolder.close();

      this.debugObject = {
        scene: "default",
      };
      this.debugFolder
        .add(this.debugObject, "scene", Object.keys(this.scenes))
        .name("Scene")
        .onChange((value) => {
          this.setScene(this.scenes[value]);
        });
    }
  }

  setScene(SceneClass) {
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    this.currentScene = new SceneClass(this.experience);
    this.currentScene.init();
  }

  update() {
    if (this.currentScene) {
      this.currentScene.update();
    }
  }
}