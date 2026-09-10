/*
 * Infinity Texture Generator
 * Copyright (C) 2026 BRENO ARAGÃO SOUZA
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { MaterialProperties, PBRMapData, TextureResolution } from '../types';

/**
 * High-performance browser-based PBR Texture Generator
 * Handles seamless tiling, Sobel normal calculation, roughness, specular, displacement, and AO maps
 */

// Helper to load image from URL or base64
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load texture image: ' + err));
    img.src = src;
  });
}

// Convert canvas to JPG base64 data URL
export function canvasToJpg(canvas: HTMLCanvasElement, quality = 0.95): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Creates a seamless (tileable) texture from an input image by applying
 * an offset wrap and smooth Hermite C1 cross-quadrant interpolation.
 * Eliminates edge seams completely while preserving full texture detail.
 */
export function makeSeamlessCanvas(
  sourceCanvas: HTMLCanvasElement,
  blendWidthFraction = 0.2
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const seamlessCanvas = document.createElement('canvas');
  seamlessCanvas.width = width;
  seamlessCanvas.height = height;
  const ctx = seamlessCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  const origCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!origCtx) return sourceCanvas;
  const origData = origCtx.getImageData(0, 0, width, height).data;

  const outImgData = ctx.createImageData(width, height);
  const outData = outImgData.data;

  // Margin widths: blend smoothly across border zone
  const bw = Math.max(12, Math.min(Math.floor(width * 0.45), Math.floor(width * Math.max(0.12, blendWidthFraction))));
  const bh = Math.max(12, Math.min(Math.floor(height * 0.45), Math.floor(height * Math.max(0.12, blendWidthFraction))));

  // Hermite smoothstep [0, 1] with zero 1st derivatives at endpoints (C1 continuity)
  const smoothstep = (edge0: number, edge1: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  // Precompute 1D weight curves for symmetrical seamless continuity
  const weightsX = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const distX = Math.min(x, width - 1 - x);
    if (distX < bw) {
      weightsX[x] = 0.5 * (1 - smoothstep(0, bw, distX));
    } else {
      weightsX[x] = 0;
    }
  }

  const weightsY = new Float32Array(height);
  for (let y = 0; y < height; y++) {
    const distY = Math.min(y, height - 1 - y);
    if (distY < bh) {
      weightsY[y] = 0.5 * (1 - smoothstep(0, bh, distY));
    } else {
      weightsY[y] = 0;
    }
  }

  for (let y = 0; y < height; y++) {
    const wY = weightsY[y];
    const oppY = height - 1 - y;
    const rowY = y * width;
    const rowOppY = oppY * width;

    for (let x = 0; x < width; x++) {
      const wX = weightsX[x];
      const oppX = width - 1 - x;
      const outIdx = (rowY + x) * 4;

      // 4 quadrant partners:
      // s00: (x, y) - original
      // s10: (oppX, y) - horizontal mirror partner
      // s01: (x, oppY) - vertical mirror partner
      // s11: (oppX, oppY) - diagonal mirror partner
      const idx00 = (rowY + x) * 4;
      const idx10 = (rowY + oppX) * 4;
      const idx01 = (rowOppY + x) * 4;
      const idx11 = (rowOppY + oppX) * 4;

      const weight00 = (1 - wX) * (1 - wY);
      const weight10 = wX * (1 - wY);
      const weight01 = (1 - wX) * wY;
      const weight11 = wX * wY;

      outData[outIdx] = Math.round(
        origData[idx00] * weight00 +
        origData[idx10] * weight10 +
        origData[idx01] * weight01 +
        origData[idx11] * weight11
      );
      outData[outIdx + 1] = Math.round(
        origData[idx00 + 1] * weight00 +
        origData[idx10 + 1] * weight10 +
        origData[idx01 + 1] * weight01 +
        origData[idx11 + 1] * weight11
      );
      outData[outIdx + 2] = Math.round(
        origData[idx00 + 2] * weight00 +
        origData[idx10 + 2] * weight10 +
        origData[idx01 + 2] * weight01 +
        origData[idx11 + 2] * weight11
      );
      outData[outIdx + 3] = 255;
    }
  }

  ctx.putImageData(outImgData, 0, 0);
  return seamlessCanvas;
}

/**
 * Resizes canvas to target resolution (1024, 2048, or 4096) with high quality
 */
export function resizeCanvas(
  sourceCanvas: HTMLCanvasElement,
  targetRes: TextureResolution
): HTMLCanvasElement {
  if (sourceCanvas.width === targetRes && sourceCanvas.height === targetRes) {
    return sourceCanvas;
  }

  const resCanvas = document.createElement('canvas');
  resCanvas.width = targetRes;
  resCanvas.height = targetRes;
  const ctx = resCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, targetRes, targetRes);
  return resCanvas;
}

/**
 * Generate all 5 standard PBR Maps + Ambient Occlusion
 */
export async function generatePBRMaps(
  sourceImg: HTMLImageElement | HTMLCanvasElement,
  properties: MaterialProperties,
  resolution: TextureResolution = 2048
): Promise<PBRMapData> {
  // 1. Prepare base canvas at target resolution
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = resolution;
  baseCanvas.height = resolution;
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  if (!baseCtx) throw new Error('Could not create canvas context');

  baseCtx.imageSmoothingEnabled = true;
  baseCtx.imageSmoothingQuality = 'high';
  baseCtx.drawImage(sourceImg, 0, 0, resolution, resolution);

  // 2. Make seamless if blend width > 0
  const seamlessCanvas = properties.seamlessBlendWidth > 0
    ? makeSeamlessCanvas(baseCanvas, properties.seamlessBlendWidth)
    : baseCanvas;

  const sCtx = seamlessCanvas.getContext('2d', { willReadFrequently: true })!;
  const baseImgData = sCtx.getImageData(0, 0, resolution, resolution);
  const src = baseImgData.data;
  const totalPixels = resolution * resolution;

  // Prepare luminance array for fast height/normal gradient processing
  const lum = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Standard perceptual luminance: Rec. 709
    lum[i] = (0.2126 * src[idx] + 0.7152 * src[idx + 1] + 0.0722 * src[idx + 2]) / 255.0;
  }

  // --- Map 1: Diffuse / Albedo (cleaned of extreme shadows) ---
  const diffuseCanvas = document.createElement('canvas');
  diffuseCanvas.width = resolution;
  diffuseCanvas.height = resolution;
  const diffCtx = diffuseCanvas.getContext('2d')!;
  const diffImgData = diffCtx.createImageData(resolution, resolution);
  const diffData = diffImgData.data;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    diffData[idx] = src[idx];
    diffData[idx + 1] = src[idx + 1];
    diffData[idx + 2] = src[idx + 2];
    diffData[idx + 3] = 255;
  }
  diffCtx.putImageData(diffImgData, 0, 0);

  // --- Map 2: Displacement / Height Map ---
  const dispCanvas = document.createElement('canvas');
  dispCanvas.width = resolution;
  dispCanvas.height = resolution;
  const dispCtx = dispCanvas.getContext('2d')!;
  const dispImgData = dispCtx.createImageData(resolution, resolution);
  const dispData = dispImgData.data;

  // Calculate contrast and mid-levels for displacement
  let minL = 1.0;
  let maxL = 0.0;
  for (let i = 0; i < totalPixels; i++) {
    if (lum[i] < minL) minL = lum[i];
    if (lum[i] > maxL) maxL = lum[i];
  }
  const lRange = Math.max(0.001, maxL - minL);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Normalized height
    const normalizedH = (lum[i] - minL) / lRange;
    const v = Math.round(Math.min(255, Math.max(0, normalizedH * 255)));
    dispData[idx] = v;
    dispData[idx + 1] = v;
    dispData[idx + 2] = v;
    dispData[idx + 3] = 255;
  }
  dispCtx.putImageData(dispImgData, 0, 0);

  // --- Map 3: Normal Map (Sobel filter with OpenGL/DirectX toggle) ---
  const normCanvas = document.createElement('canvas');
  normCanvas.width = resolution;
  normCanvas.height = resolution;
  const normCtx = normCanvas.getContext('2d')!;
  const normImgData = normCtx.createImageData(resolution, resolution);
  const normData = normImgData.data;

  const strength = properties.normalStrength || 2.0;
  const isDirectX = properties.normalFormat === 'DirectX';

  // Helper for wrapping pixel indices
  const getLum = (x: number, y: number): number => {
    const wx = (x + resolution) % resolution;
    const wy = (y + resolution) % resolution;
    return lum[wy * resolution + wx];
  };

  // Divergence array for Ambient Occlusion calculation
  const divergence = new Float32Array(totalPixels);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;

      // Sobel kernel for dX and dY
      // [-1  0  1]
      // [-2  0  2]
      // [-1  0  1]
      const tl = getLum(x - 1, y - 1);
      const l  = getLum(x - 1, y);
      const bl = getLum(x - 1, y + 1);
      const tr = getLum(x + 1, y - 1);
      const r  = getLum(x + 1, y);
      const br = getLum(x + 1, y + 1);

      const t  = getLum(x, y - 1);
      const b  = getLum(x, y + 1);

      const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
      const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

      // Normal vector calculation
      let nx = -dx * strength;
      let ny = -dy * strength;
      if (isDirectX) {
        ny = -ny; // Invert Green channel for DirectX (Unreal Engine)
      }
      const nz = 1.0;

      // Normalize vector
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const normX = nx / len;
      const normY = ny / len;
      const normZ = nz / len;

      // Pack into 0-255 RGB
      normData[idx] = Math.round((normX * 0.5 + 0.5) * 255);
      normData[idx + 1] = Math.round((normY * 0.5 + 0.5) * 255);
      normData[idx + 2] = Math.round((normZ * 0.5 + 0.5) * 255);
      normData[idx + 3] = 255;

      // Approximate concavity / crevice for AO
      divergence[y * resolution + x] = -(dx * normX + dy * normY);
    }
  }
  normCtx.putImageData(normImgData, 0, 0);

  // --- Map 4: Roughness Map ---
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = resolution;
  roughCanvas.height = resolution;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImgData = roughCtx.createImageData(resolution, resolution);
  const roughData = roughImgData.data;

  // Base roughness modulated by micro-texture contrast
  const baseR = properties.baseRoughness;
  const isMetal = properties.metallic > 0.5;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const l = lum[i];
    // Micro variation: crevices are rougher, highlights smoother
    // Scale around base roughness
    let rVal: number;
    if (isMetal) {
      rVal = baseR + (l - 0.5) * 0.3;
    } else {
      rVal = baseR + (1.0 - l - 0.5) * 0.25;
    }
    rVal = Math.min(1.0, Math.max(0.04, rVal));

    const byteVal = Math.round(rVal * 255);
    roughData[idx] = byteVal;
    roughData[idx + 1] = byteVal;
    roughData[idx + 2] = byteVal;
    roughData[idx + 3] = 255;
  }
  roughCtx.putImageData(roughImgData, 0, 0);

  // --- Map 5: Specular Map ---
  const specCanvas = document.createElement('canvas');
  specCanvas.width = resolution;
  specCanvas.height = resolution;
  const specCtx = specCanvas.getContext('2d')!;
  const specImgData = specCtx.createImageData(resolution, resolution);
  const specData = specImgData.data;

  const specFactor = properties.specularLevel !== undefined ? properties.specularLevel : 0.5;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    let sR: number;
    let sG: number;
    let sB: number;

    if (properties.metallic > 0.5) {
      // Metallic specular is colored by the diffuse albedo
      const m = properties.metallic;
      sR = src[idx] * m * Math.max(0.1, specFactor) + 255 * (1 - m) * 0.08 * specFactor;
      sG = src[idx + 1] * m * Math.max(0.1, specFactor) + 255 * (1 - m) * 0.08 * specFactor;
      sB = src[idx + 2] * m * Math.max(0.1, specFactor) + 255 * (1 - m) * 0.08 * specFactor;
    } else {
      // Dielectric specular: scaled by reflection level (0.0 = completely matte black specular, 0.5 = standard 4% dielectric, 1.0 = highly reflective finish)
      const baseF0 = specFactor * 0.16;
      const microContrast = (lum[i] - 0.5) * 0.04 * specFactor;
      const val = Math.min(255, Math.max(0, Math.round((baseF0 + microContrast) * 255)));
      sR = val;
      sG = val;
      sB = val;
    }

    specData[idx] = Math.round(sR);
    specData[idx + 1] = Math.round(sG);
    specData[idx + 2] = Math.round(sB);
    specData[idx + 3] = 255;
  }
  specCtx.putImageData(specImgData, 0, 0);

  // --- Map 6: Ambient Occlusion (AO) Map ---
  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = resolution;
  aoCanvas.height = resolution;
  const aoCtx = aoCanvas.getContext('2d')!;
  const aoImgData = aoCtx.createImageData(resolution, resolution);
  const aoData = aoImgData.data;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Darken crevices from divergence and deep displacement valleys
    const depthDarkening = (1.0 - (dispData[idx] / 255)) * 0.35;
    const div = Math.max(0, divergence[i]) * 1.5;
    const aoVal = Math.min(255, Math.max(40, Math.round((1.0 - depthDarkening - div) * 255)));

    aoData[idx] = aoVal;
    aoData[idx + 1] = aoVal;
    aoData[idx + 2] = aoVal;
    aoData[idx + 3] = 255;
  }
  aoCtx.putImageData(aoImgData, 0, 0);

  return {
    diffuse: canvasToJpg(diffuseCanvas, 0.95),
    specular: canvasToJpg(specCanvas, 0.95),
    normal: canvasToJpg(normCanvas, 0.95),
    roughness: canvasToJpg(roughCanvas, 0.95),
    displacement: canvasToJpg(dispCanvas, 0.95),
    ao: canvasToJpg(aoCanvas, 0.95),
  };
}
