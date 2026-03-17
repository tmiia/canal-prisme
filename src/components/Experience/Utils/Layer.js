import * as THREE from "three";
import Experience from "../Experience.js";
import { lerp, smoothstep } from "../Utils/math.js";

const MAX_IMAGES = 6;

const DEPTH_WINDOW = 400;
const MIN_SCALE = 0.6;
const MAX_SCALE = 0.8;
const MIN_OPACITY = 0.12;
const MAX_OPACITY = 1.0;

export default class Layer {
  /**
   * @param {Object} options
   * @param {number} [options.zDepth=0]
   * @param {Array<{x: number, y: number}>} [options.cellPositions] - from GridPlacement
   * @param {number} [options.maxWidth=250]
   */
  constructor(options = {}) {
    this.experience = new Experience();
    this.camera = this.experience.camera;

    this.zDepth = options.zDepth || 0;
    this.cellPositions = options.cellPositions || [];
    this.maxWidth = options.maxWidth || 250;

    this.images = [];
    this.group = new THREE.Group();
  }

  add(texture, data = {}) {
    if (this.images.length >= MAX_IMAGES) return;

    const index = this.images.length;
    const pos = this.cellPositions[index] || { x: 0, y: 0 };

    const nativeW = texture.image.width;
    const nativeH = texture.image.height;
    const ratio = nativeW / nativeH;

    const baseW = this.maxWidth;
    const baseH = this.maxWidth / ratio;

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(pos.x, pos.y, 0);
    mesh.scale.set(baseW, baseH, 1);
    Object.assign(mesh.userData, data);

    this.group.add(mesh);
    this.images.push({ mesh, texture, baseW, baseH });

    return mesh;
  }

  updateWithScroll(scrollDepth) {
    if (this.images.length === 0) return;

    const effectiveZ = this.zDepth + scrollDepth;
    this.group.position.z = effectiveZ;

    const cameraZ = this.camera.instance.position.z;
    const distanceToCamera = Math.abs(cameraZ - effectiveZ);

    const proximityRaw = 1 - Math.min(distanceToCamera / DEPTH_WINDOW, 1);
    const proximity = smoothstep(proximityRaw);

    for (const { mesh, baseW, baseH } of this.images) {
      if (mesh.userData.focused || mesh.userData.hovered) continue;

      const scaleMult = lerp(MIN_SCALE, MAX_SCALE, proximity);
      mesh.scale.set(baseW * scaleMult, baseH * scaleMult, 1);

      mesh.material.opacity = lerp(MIN_OPACITY, MAX_OPACITY, proximity);
      mesh.material.depthWrite = false;
    }
  }

  getMeshes() {
    return this.images.map((img) => img.mesh);
  }

  dispose() {
    for (const { mesh } of this.images) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.group.remove(mesh);
    }
    this.images = [];
  }
}
