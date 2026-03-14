import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Vector2,
} from "three";
import vertexShader from "./vertexShader.glsl";
import fragmentShader from "./fragmentShader.glsl";

export default class Plane {
  constructor({
    width = 100,
    height = 100,
    color = "#ffffff",
    texture = null,
    parentScene = null,
    zoomFactor = 1.0,
  } = {}) {
    this.parentScene = parentScene;
    this.width = width;
    this.height = height;

    if (texture) {
      this.material = new ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uOpacity: { value: 1.0 },
          uParallaxOffset: { value: new Vector2(0, 0) },
          uZoomFactor: { value: zoomFactor },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });

      const opacityUniform = this.material.uniforms.uOpacity;
      Object.defineProperty(this.material, "opacity", {
        get() { return opacityUniform.value; },
        set(v) { opacityUniform.value = v; },
        configurable: true,
      });
    } else {
      this.material = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
    }

    this.geometry = new PlaneGeometry(this.width, this.height);
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
