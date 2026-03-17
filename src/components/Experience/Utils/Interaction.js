import * as THREE from "three";
import gsap from "gsap";
import Experience from "../Experience.js";

const HOVER_SCALE = 1.07;
const HOVER_DURATION = 0.3;
const FOCUS_DURATION = 0.8;
const UNFOCUS_DURATION = 0.6;
const FILL_RATIO = 0.45;

export default class Interaction {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;
    this.sceneManager = this.experience.sceneManager;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this._meshRegistry = new Map();
    this._hoveredMesh = null;
    this._focusedMesh = null;
    this._focusData = null;
    this._isAnimating = false;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this.canvas.addEventListener("pointermove", this._onPointerMove);
    this.canvas.addEventListener("click", this._onClick);
    window.addEventListener("keydown", this._onKeyDown);
  }

  register(sceneKey, meshes) {
    this._meshRegistry.set(sceneKey, meshes);
  }

  unregister(sceneKey) {
    this._meshRegistry.delete(sceneKey);
  }

  _getActiveMeshes() {
    const key = this.sceneManager.currentSceneKey;
    return key ? this._meshRegistry.get(key) || [] : [];
  }

  _updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _raycast() {
    this.raycaster.setFromCamera(this.pointer, this.camera.instance);
    const meshes = this._getActiveMeshes();
    if (meshes.length === 0) return null;
    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  // ── Pointer move (hover) ──────────────────────────────────────────

  _onPointerMove(event) {
    this._updatePointer(event);
    if (this._isAnimating) return;

    const hit = this._raycast();

    if (hit === this._hoveredMesh) return;

    if (this._hoveredMesh && this._hoveredMesh !== this._focusedMesh) {
      this._onHoverLeave(this._hoveredMesh);
    }

    if (hit && hit !== this._focusedMesh) {
      this._onHoverEnter(hit);
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "default";
    }

    this._hoveredMesh = hit;
  }

  // ── Click (focus / unfocus) ───────────────────────────────────────

  _onClick(event) {
    this._updatePointer(event);
    if (this._isAnimating) return;

    const hit = this._raycast();

    if (hit) {
      if (hit === this._focusedMesh) return;

      if (this._focusedMesh) {
        this._unfocus(() => this._focus(hit));
      } else {
        if (this._hoveredMesh === hit) this._clearHover(hit);
        this._focus(hit);
      }
    } else if (this._focusedMesh) {
      this._unfocus();
    }
  }

  // ── Keyboard (ESC) ───────────────────────────────────────────────

  _onKeyDown(event) {
    if (event.key === "Escape" && this._focusedMesh && !this._isAnimating) {
      this._unfocus();
    }
  }

  // ── Hover helpers ─────────────────────────────────────────────────

  _onHoverEnter(mesh) {
    mesh.userData.hovered = true;
    mesh.userData._preHoverScaleX = mesh.scale.x;
    mesh.userData._preHoverScaleY = mesh.scale.y;

    gsap.to(mesh.scale, {
      x: mesh.scale.x * HOVER_SCALE,
      y: mesh.scale.y * HOVER_SCALE,
      duration: HOVER_DURATION,
      ease: "power2.out",
      overwrite: true,
    });
  }

  _onHoverLeave(mesh) {
    const tx = mesh.userData._preHoverScaleX ?? mesh.scale.x;
    const ty = mesh.userData._preHoverScaleY ?? mesh.scale.y;

    gsap.to(mesh.scale, {
      x: tx,
      y: ty,
      duration: HOVER_DURATION,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        mesh.userData.hovered = false;
        delete mesh.userData._preHoverScaleX;
        delete mesh.userData._preHoverScaleY;
      },
    });
  }

  _clearHover(mesh) {
    gsap.killTweensOf(mesh.scale);
    if (mesh.userData._preHoverScaleX != null) {
      mesh.scale.x = mesh.userData._preHoverScaleX;
      mesh.scale.y = mesh.userData._preHoverScaleY;
    }
    mesh.userData.hovered = false;
    delete mesh.userData._preHoverScaleX;
    delete mesh.userData._preHoverScaleY;
  }

  // ── Focus helpers ─────────────────────────────────────────────────

  _getPlaneWorldSize(mesh) {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    return {
      width: (box.max.x - box.min.x) * mesh.scale.x,
      height: (box.max.y - box.min.y) * mesh.scale.y,
    };
  }

  _computeFocusZ(worldWidth, worldHeight) {
    const cam = this.camera.instance;
    const fovRad = (cam.fov * Math.PI) / 180;
    const tanHalfFov = Math.tan(fovRad / 2);

    const distByWidth = worldWidth / (FILL_RATIO * 2 * tanHalfFov * cam.aspect);
    const distByHeight = worldHeight / (FILL_RATIO * 2 * tanHalfFov);
    const distance = Math.max(distByWidth, distByHeight);

    return cam.position.z - distance;
  }

  _focus(mesh) {
    this._isAnimating = true;
    mesh.userData.focused = true;

    const threeScene = this.sceneManager.currentScene.scene;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);

    const needsReparent = mesh.parent !== threeScene;
    const originalParent = mesh.parent;

    this._focusData = {
      mesh,
      originalParent,
      originalPosition: mesh.position.clone(),
      originalScale: mesh.scale.clone(),
      originalRenderOrder: mesh.renderOrder,
      originalDepthTest: mesh.material.depthTest,
      originalOpacity: mesh.material.opacity,
      needsReparent,
    };

    if (needsReparent) {
      originalParent.remove(mesh);
      threeScene.add(mesh);
      mesh.position.copy(worldPos);
    }

    const { width, height } = this._getPlaneWorldSize(mesh);
    const targetZ = this._computeFocusZ(width, height);

    mesh.renderOrder = 999;
    mesh.material.depthTest = false;

    gsap.to(mesh.position, {
      x: 0,
      y: 0,
      z: targetZ,
      duration: FOCUS_DURATION,
      ease: "power3.out",
      onComplete: () => {
        this._isAnimating = false;
      },
    });

    gsap.to(mesh.material, {
      opacity: 1,
      duration: FOCUS_DURATION,
      ease: "power3.out",
    });

    const cam = this.camera.instance;
    const fovRad = (cam.fov * Math.PI) / 180;
    const visH = 2 * (cam.position.z - targetZ) * Math.tan(fovRad / 2);
    const visW = visH * cam.aspect;
    const activeHalfVh = (height / visH) * 50;
    const activeHalfVw = (width / visW) * 50;

    window.dispatchEvent(
      new CustomEvent("planefocus", {
        detail: {
          title: mesh.userData.title ?? null,
          sceneKey: this.sceneManager.currentSceneKey,
          activeHalfVh,
          activeHalfVw,
          artData: { ...mesh.userData },
        },
      }),
    );

    this._focusedMesh = mesh;
    this._hoveredMesh = null;
    this.canvas.style.cursor = "default";
  }

  _unfocus(onComplete) {
    if (!this._focusData) return;

    window.dispatchEvent(new CustomEvent("planeunfocus"));

    this._isAnimating = true;
    const data = this._focusData;
    const mesh = data.mesh;

    if (data.needsReparent) {
      const currentWorldPos = new THREE.Vector3();
      mesh.getWorldPosition(currentWorldPos);

      const threeScene = this.sceneManager.currentScene.scene;
      threeScene.remove(mesh);
      data.originalParent.add(mesh);

      const localPos = data.originalParent.worldToLocal(currentWorldPos);
      mesh.position.copy(localPos);
    }

    gsap.to(mesh.position, {
      x: data.originalPosition.x,
      y: data.originalPosition.y,
      z: data.originalPosition.z,
      duration: UNFOCUS_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        mesh.renderOrder = data.originalRenderOrder;
        mesh.material.depthTest = data.originalDepthTest;
        mesh.userData.focused = false;

        this._focusedMesh = null;
        this._focusData = null;
        this._isAnimating = false;

        if (onComplete) onComplete();
      },
    });

    gsap.to(mesh.scale, {
      x: data.originalScale.x,
      y: data.originalScale.y,
      z: data.originalScale.z,
      duration: UNFOCUS_DURATION,
      ease: "power2.inOut",
    });

    gsap.to(mesh.material, {
      opacity: data.originalOpacity,
      duration: UNFOCUS_DURATION,
      ease: "power2.inOut",
    });
  }

  // ── Cleanup ───────────────────────────────────────────────────────

  destroy() {
    this.canvas.removeEventListener("pointermove", this._onPointerMove);
    this.canvas.removeEventListener("click", this._onClick);
    window.removeEventListener("keydown", this._onKeyDown);

    if (this._focusedMesh) {
      gsap.killTweensOf(this._focusedMesh.position);
      gsap.killTweensOf(this._focusedMesh.scale);
    }
    if (this._hoveredMesh) {
      gsap.killTweensOf(this._hoveredMesh.scale);
    }

    this._meshRegistry.clear();
  }
}
