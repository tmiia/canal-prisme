import { PlaneGeometry } from "three";
import gsap from "gsap";
import Scene from "../Scene.js";
import Plane from "../Shared/Plane/Plane.js";
import FlexGroup from "../../Utils/FlexGroup.js";
import listData from "../../../../data/listData.js";

const LIST_CAMERA_Z = 400;
const PARALLAX_STRENGTH = 0.05;
const ZOOM_FACTOR = 1.09;

export default class ListScene extends Scene {
  init() {
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;

    this.scrollX = 0;
    this.scrollY = 0;
    this._isAnimating = false;
    this.planes = [];

    this._computeWorldDimensions();

    this.padLeftFactor = 0.32;
    this.padLeftFactorCol = 0.15;

    if (this.resources.toLoad === this.resources.loaded) {
      this.onResourcesLoaded();
    } else {
      this.resources.on("loaded", () => this.onResourcesLoaded());
    }

    this.experience.sizes.on("resize.listScene", () => this.onResize());
  }

  _computeWorldDimensions() {
    const cam = this.experience.camera.instance;
    const fovRad = (cam.fov * Math.PI) / 180;
    this.worldH = 2 * LIST_CAMERA_Z * Math.tan(fovRad / 2);
    this.worldW = this.worldH * cam.aspect;
    this.pxToWorld = this.worldH / this.sizes.height;
  }

  onResourcesLoaded() {
    const planeW = this.worldW * 0.35;
    const planeH = planeW * (9 / 16);
    const gap = this.worldH * 0.08;
    this.flexGroup = new FlexGroup({
      direction: "row",
      justify: "flex-start",
      align: "flex-start",
      gap,
      anchor: {
        x: -this.worldW / 2 + this.worldW * this.padLeftFactor,
        y: planeH / 2,
      },
      maxMainSize: this.worldH,
    });

    this.planes = listData.map((item) => {
      const texture = this.resources.items[`galleryTexture${item.id}`];
      const plane = new Plane({
        width: planeW,
        height: planeH,
        texture,
        parentScene: this.scene,
        zoomFactor: ZOOM_FACTOR,
      });
      plane.mesh.userData.title = item.title;
      this.flexGroup.add(plane.mesh);
      return plane;
    });

    this.flexGroup.update();
    this._applyParallax();
    this._updateCSSVars();

    this.experience.interaction.register(
      "list",
      this.planes.map((p) => p.mesh),
    );
  }

  _applyParallax() {
    if (!this.flexGroup || this.planes.length === 0) return;

    const isRow = this.flexGroup.direction === "row";
    const scroll = isRow ? this.scrollX : this.scrollY;
    const children = this.flexGroup.children;
    const stride = isRow
      ? (children[0]?.width || 0) + this.flexGroup.gap
      : (children[0]?.height || 0) + this.flexGroup.gap;

    if (stride === 0) return;

    for (let i = 0; i < this.planes.length; i++) {
      const uniforms = this.planes[i].material.uniforms;
      if (!uniforms?.uParallaxOffset) continue;

      const dist = (i * stride - scroll) / stride;

      if (isRow) {
        uniforms.uParallaxOffset.value.set(dist * PARALLAX_STRENGTH, 0);
      } else {
        uniforms.uParallaxOffset.value.set(0, dist * PARALLAX_STRENGTH);
      }
    }
  }

  _updateCSSVars() {
    const child = this.flexGroup?.children[0];
    if (!child) return;

    const isRow = this.flexGroup.direction === "row";
    const stride = isRow
      ? child.width + this.flexGroup.gap
      : child.height + this.flexGroup.gap;

    const planeScreenHalf = (child.height / this.worldH) * 50;
    const strideScreen = (stride / this.worldH) * 100;

    const root = document.documentElement;
    root.style.setProperty("--plane-half-vh", `${planeScreenHalf}vh`);
    root.style.setProperty("--section-h", `${strideScreen}vh`);
  }

  _recalcAnchor() {
    if (!this.flexGroup) return;
    const isRow = this.flexGroup.direction === "row";
    const planeH = this.flexGroup.children[0]?.height || 0;
    const planeW = this.flexGroup.children[0]?.width || 0;

    if (isRow) {
      this.flexGroup.anchor.x =
        -this.worldW / 2 + this.worldW * this.padLeftFactor - this.scrollX;
      this.flexGroup.anchor.y = planeH / 2;
    } else {
      this.flexGroup.anchor.x = -this.worldW / 2 + this.worldW * this.padLeftFactorCol;
      this.flexGroup.anchor.y = planeH / 2 + this.scrollY;
    }
  }

  onResize() {
    if (!this.flexGroup) return;

    this._computeWorldDimensions();

    const planeW = this.worldW * 0.35;
    const planeH = planeW * (9 / 16);

    for (let i = 0; i < this.planes.length; i++) {
      const plane = this.planes[i];
      plane.geometry.dispose();
      plane.geometry = new PlaneGeometry(planeW, planeH);
      plane.mesh.geometry = plane.geometry;

      this.flexGroup.children[i].width = planeW;
      this.flexGroup.children[i].height = planeH;
    }

    this.flexGroup.gap = this.worldH * 0.08;
    this.flexGroup.maxMainSize = this.worldH;
    this._recalcAnchor();
    this.flexGroup.update();
    this._applyParallax();
    this._updateCSSVars();
  }

  toggleDirection() {
    if (!this.flexGroup) return;

    const wasRow = this.flexGroup.direction === "row";
    const oldScroll = wasRow ? this.scrollX : this.scrollY;
    const children = this.flexGroup.children;
    const gap = this.flexGroup.gap;

    const oldStride = wasRow
      ? (children[0]?.width || 0) + gap
      : (children[0]?.height || 0) + gap;
    const visibleIndex = oldStride > 0 ? Math.round(oldScroll / oldStride) : 0;

    this.flexGroup.direction = wasRow ? "column" : "row";
    const isRow = this.flexGroup.direction === "row";

    const newStride = isRow
      ? (children[0]?.width || 0) + gap
      : (children[0]?.height || 0) + gap;
    const newScroll = visibleIndex * newStride;

    this.scrollX = isRow ? newScroll : 0;
    this.scrollY = isRow ? 0 : newScroll;
    this._recalcAnchor();

    this._isAnimating = true;
    const dur = 0.8;
    this.flexGroup.update({
      animate: true,
      duration: dur,
      ease: "power2.inOut",
    });
    gsap.delayedCall(dur, () => {
      this._isAnimating = false;
    });

    this._updateCSSVars();

    return visibleIndex;
  }

  setScrollOffset(pixelOffset) {
    if (this._isAnimating || !this.flexGroup) return;

    const worldOffset = pixelOffset * this.pxToWorld;

    if (this.flexGroup.direction === "row") {
      this.scrollX = worldOffset;
    } else {
      this.scrollY = worldOffset;
    }
    this._recalcAnchor();
    this.flexGroup.update();
    this._applyParallax();
  }

  onEnter() {
    if (this.flexGroup) {
      this.flexGroup.fadeIn();
    }
  }

  update() {}

  destroy() {
    super.destroy();
    this.experience.interaction.unregister("list");
    this.experience.sizes.off("resize.listScene");

    for (const plane of this.planes) {
      plane.destroy();
    }

    if (this.flexGroup) {
      this.flexGroup.destroy();
    }

    document.documentElement.style.removeProperty("--plane-half-vh");
    document.documentElement.style.removeProperty("--section-h");
  }
}
