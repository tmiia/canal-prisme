import * as THREE from "three";
import gsap from "gsap";
import Experience from "../Experience.js";

export default class FlexGroup {
  constructor(options = {}) {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;

    this.direction = options.direction || "row";
    this.justify = options.justify || "flex-start";
    this.align = options.align || "flex-start";
    this.gap = options.gap || 0;
    this.wrap = options.wrap || false;
    this.anchor = options.anchor || { x: 0, y: 0 };
    this.zIndex = options.zIndex || 0;
    this.maxMainSize = options.maxMainSize || null;

    this.children = [];
    this._cachedSize = { width: 0, height: 0 };

    this.experience.registerFlexGroup(this);
  }

  /**
   * Add a child mesh or nested FlexGroup.
   * Options: { width, height, zIndex }
   * Width/height auto-detected from geometry if omitted.
   */
  add(child, options = {}) {
    const entry = {
      child,
      zIndex: options.zIndex || 0,
      width: 0,
      height: 0,
    };

    if (child instanceof FlexGroup) {
      child.update();
      const size = child.getSize();
      entry.width = options.width || size.width;
      entry.height = options.height || size.height;
    } else if (child.geometry) {
      child.geometry.computeBoundingBox();
      const box = child.geometry.boundingBox;
      entry.width = options.width || (box.max.x - box.min.x);
      entry.height = options.height || (box.max.y - box.min.y);
    }

    this.children.push(entry);
    return this;
  }

  remove(child) {
    this.children = this.children.filter((e) => e.child !== child);
    return this;
  }

  getSize() {
    return { ...this._cachedSize };
  }

  update({ animate = false, duration = 0.8, ease = "power2.inOut" } = {}) {
    this._animating = animate;
    this._animDuration = duration;
    this._animEase = ease;

    if (this.children.length === 0) {
      this._cachedSize = { width: 0, height: 0 };
      return;
    }

    for (const entry of this.children) {
      if (entry.child instanceof FlexGroup) {
        entry.child.update({ animate, duration, ease });
        const size = entry.child.getSize();
        entry.width = size.width;
        entry.height = size.height;
      }
    }

    const isRow = this.direction === "row";
    const lines = this._buildLines(isRow);

    let crossOffset = 0;
    let totalMainSize = 0;
    let totalCrossSize = 0;

    for (const line of lines) {
      const mainSizes = line.map((e) => (isRow ? e.width : e.height));
      const crossSizes = line.map((e) => (isRow ? e.height : e.width));
      const lineCross = Math.max(...crossSizes);

      const containerMain =
        this.maxMainSize ||
        (isRow ? this.sizes.width : this.sizes.height);

      const positions = this._justify(mainSizes, containerMain);

      for (let i = 0; i < line.length; i++) {
        const entry = line[i];
        const mainPos = positions[i];
        const crossPos = this._align(
          isRow ? entry.height : entry.width,
          lineCross
        );

        this._applyPosition(
          entry,
          mainPos,
          crossOffset + crossPos,
          isRow
        );
      }

      const lineMainSize =
        positions.length > 0
          ? positions[positions.length - 1] +
            mainSizes[mainSizes.length - 1]
          : 0;
      totalMainSize = Math.max(totalMainSize, lineMainSize);

      crossOffset += lineCross + this.gap;
      totalCrossSize += lineCross;
    }

    totalCrossSize += this.gap * (lines.length - 1);

    this._cachedSize = isRow
      ? { width: totalMainSize, height: totalCrossSize }
      : { width: totalCrossSize, height: totalMainSize };

    this._animating = false;
  }

  _buildLines(isRow) {
    if (!this.wrap) return [this.children];

    const containerMain =
      this.maxMainSize ||
      (isRow ? this.sizes.width : this.sizes.height);
    const lines = [];
    let currentLine = [];
    let currentMainSize = 0;

    for (const entry of this.children) {
      const itemMain = isRow ? entry.width : entry.height;

      if (
        currentLine.length > 0 &&
        currentMainSize + this.gap + itemMain > containerMain
      ) {
        lines.push(currentLine);
        currentLine = [entry];
        currentMainSize = itemMain;
      } else {
        if (currentLine.length > 0) currentMainSize += this.gap;
        currentMainSize += itemMain;
        currentLine.push(entry);
      }
    }

    if (currentLine.length > 0) lines.push(currentLine);
    return lines;
  }

  /**
   * Returns an array of main-axis positions (left/top edge of each item)
   * based on the justify rule.
   */
  _justify(sizes, containerSize) {
    const n = sizes.length;
    if (n === 0) return [];

    const totalContent = sizes.reduce((a, b) => a + b, 0);
    const totalGap = this.gap * (n - 1);
    const freeSpace = containerSize - totalContent - totalGap;
    const positions = [];

    switch (this.justify) {
      case "flex-end": {
        let cursor = freeSpace;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + this.gap;
        }
        break;
      }

      case "center": {
        let cursor = freeSpace / 2;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + this.gap;
        }
        break;
      }

      case "space-between": {
        if (n === 1) {
          positions.push(0);
          break;
        }
        const spaceBetween =
          (containerSize - totalContent) / (n - 1);
        let cursor = 0;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + spaceBetween;
        }
        break;
      }

      case "space-around": {
        const spaceAround =
          (containerSize - totalContent) / n;
        let cursor = spaceAround / 2;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + spaceAround;
        }
        break;
      }

      case "space-evenly": {
        const spaceEvenly =
          (containerSize - totalContent) / (n + 1);
        let cursor = spaceEvenly;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + spaceEvenly;
        }
        break;
      }

      case "flex-start":
      default: {
        let cursor = 0;
        for (let i = 0; i < n; i++) {
          positions.push(cursor);
          cursor += sizes[i] + this.gap;
        }
        break;
      }
    }

    return positions;
  }

  /**
   * Returns the cross-axis offset for a single item within its line.
   */
  _align(itemCross, lineCross) {
    switch (this.align) {
      case "flex-end":
        return lineCross - itemCross;
      case "center":
        return (lineCross - itemCross) / 2;
      case "flex-start":
      default:
        return 0;
    }
  }

  /**
   * Sets world position on a child (mesh or nested FlexGroup).
   * Positions are converted from a top-left layout space into Three.js
   * centered-origin space using the group's anchor.
   */
  _applyPosition(entry, mainPos, crossPos, isRow) {
    let x, y;

    if (isRow) {
      x = this.anchor.x + mainPos + entry.width / 2;
      y = this.anchor.y - crossPos - entry.height / 2;
    } else {
      x = this.anchor.x + crossPos + entry.width / 2;
      y = this.anchor.y - mainPos - entry.height / 2;
    }

    const z = this.zIndex + entry.zIndex;

    if (entry.child instanceof FlexGroup) {
      entry.child.anchor = { x: x - entry.width / 2, y: y + entry.height / 2 };
      entry.child.zIndex = z;
      entry.child.update();
    } else if (this._animating) {
      gsap.to(entry.child.position, {
        x, y, z,
        duration: this._animDuration,
        ease: this._animEase,
        overwrite: true,
      });
    } else {
      entry.child.position.set(x, y, z);
    }
  }

  destroy() {
    this.experience.unregisterFlexGroup(this);
    this.children = [];
  }
}
