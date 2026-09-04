import { MaterialCategory, MaterialProperties, TextureResolution } from '../types';

export interface PatternSynthesisConfig {
  patternType:
    | 'marble'
    | 'wood_planks'
    | 'wood_slats'
    | 'bricks'
    | 'tiles'
    | 'stone_blocks'
    | 'granite'
    | 'concrete'
    | 'asphalt'
    | 'metal_brushed'
    | 'fabric_weave'
    | 'leather'
    | 'plaster_stucco'
    | 'water_waves'
    | 'vegetation'
    | 'terrazzo'
    | 'rubber'
    | 'generic';
  primaryColor: string;      // hex
  secondaryColor: string;    // hex
  veinOrJointColor?: string; // hex
  highlightColor?: string;   // hex
  scale?: number;
  variation?: number;
}

// Color parsing utility
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  }
  return [180, 180, 180];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

// Procedural noise functions
function pseudoNoise(x: number, y: number, seed = 12.34): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, seed = 12.34): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const sX = fx * fx * (3 - 2 * fx);
  const sY = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise(i, j, seed);
  const n10 = pseudoNoise(i + 1, j, seed);
  const n01 = pseudoNoise(i, j + 1, seed);
  const n11 = pseudoNoise(i + 1, j + 1, seed);

  const x0 = n00 * (1 - sX) + n10 * sX;
  const x1 = n01 * (1 - sX) + n11 * sX;
  return x0 * (1 - sY) + x1 * sY;
}

function fbm(x: number, y: number, octaves = 4, seed = 42): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq, seed + i * 19.3) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

/**
 * Procedural Synthesis of Diffuse Textures based on Material Type & AI Classification
 */
export function generateProceduralDiffuseCanvas(
  config: PatternSynthesisConfig,
  resolution: TextureResolution = 2048
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const c1 = hexToRgb(config.primaryColor);
  const c2 = hexToRgb(config.secondaryColor);
  const cJoint = config.veinOrJointColor
    ? hexToRgb(config.veinOrJointColor)
    : ([Math.round(c1[0] * 0.4), Math.round(c1[1] * 0.4), Math.round(c1[2] * 0.4)] as [number, number, number]);
  const cHighlight = config.highlightColor ? hexToRgb(config.highlightColor) : [255, 255, 255];

  const imgData = ctx.createImageData(resolution, resolution);
  const data = imgData.data;
  const size = resolution;

  switch (config.patternType) {
    case 'marble': {
      // Marble with organic mineral veins and micro-crystalline background
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const nx = x / size;
          const ny = y / size;

          const n1 = fbm(nx * 5, ny * 5, 4, 11);
          const n2 = fbm(nx * 12, ny * 12, 3, 29);
          const veinDist = Math.sin((nx * 4 + ny * 6 + n1 * 4 + n2 * 1.5) * Math.PI);
          const veinIntensity = Math.pow(Math.abs(veinDist), 10);
          const subVein = Math.pow(Math.abs(Math.sin((nx * 8 - ny * 7 + n1 * 3) * Math.PI)), 16) * 0.7;

          const baseTone = lerpColor(c1, c2, n1 * 0.7 + n2 * 0.3);
          const withVein = lerpColor(baseTone, cJoint, Math.min(1, (1 - veinIntensity) * 0.85 + subVein));
          const grain = (pseudoNoise(x * 0.2, y * 0.2, 5) - 0.5) * 8;

          data[idx] = Math.min(255, Math.max(0, Math.round(withVein[0] + grain)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(withVein[1] + grain)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(withVein[2] + grain)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'wood_slats': {
      // Modern architectural wood slats (painel ripado) with deep gaps
      const slatCount = 14;
      const slatW = size / slatCount;
      const gapW = slatW * 0.18;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const slatIdx = Math.floor(x / slatW);
          const localX = x % slatW;
          const isGap = localX < gapW;

          if (isGap) {
            // Shadowed gap between wooden slats
            data[idx] = Math.round(cJoint[0] * 0.35);
            data[idx + 1] = Math.round(cJoint[1] * 0.35);
            data[idx + 2] = Math.round(cJoint[2] * 0.35);
            data[idx + 3] = 255;
            continue;
          }

          // Wood grain within slat
          const grainY = y * 0.04;
          const grainX = (localX - gapW) * 0.2;
          const n = fbm(grainX, grainY, 3, slatIdx * 17);
          const rings = Math.sin(grainY * 1.5 + n * 4.0);
          const t = Math.max(0, Math.min(1, 0.5 + rings * 0.3 + (n - 0.5) * 0.3));

          // Bevel edge highlight on the left of each slat
          const isBevel = localX - gapW < 3;
          const baseColor = lerpColor(c1, c2, t);
          const col = isBevel ? lerpColor(baseColor, cHighlight as [number, number, number], 0.25) : baseColor;

          data[idx] = col[0];
          data[idx + 1] = col[1];
          data[idx + 2] = col[2];
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'wood_planks': {
      // Horizontal wood planks with natural grain
      const plankCount = 6;
      const plankH = size / plankCount;

      for (let y = 0; y < size; y++) {
        const plankIdx = Math.floor(y / plankH);
        const localY = y % plankH;
        const isSeam = localY < 3 || localY > plankH - 3;

        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;

          if (isSeam) {
            data[idx] = cJoint[0];
            data[idx + 1] = cJoint[1];
            data[idx + 2] = cJoint[2];
            data[idx + 3] = 255;
            continue;
          }

          const grainX = x * 0.035;
          const grainY = (localY - 3) * 0.22;
          const n = fbm(grainX, grainY, 4, 30 + plankIdx * 19);
          const rings = Math.sin(grainY * 2.2 + n * 4.5);
          const t = Math.max(0, Math.min(1, 0.5 + rings * 0.35 + (n - 0.5) * 0.25));

          const col = lerpColor(c1, c2, t);
          data[idx] = col[0];
          data[idx + 1] = col[1];
          data[idx + 2] = col[2];
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'bricks': {
      // Running bond masonry bricks with mortar joint lines
      const rows = 10;
      const cols = 5;
      const brickH = size / rows;
      const brickW = size / cols;
      const jointSize = Math.max(3, Math.floor(size * 0.012));

      for (let y = 0; y < size; y++) {
        const row = Math.floor(y / brickH);
        const localY = y % brickH;
        const isHorizJoint = localY < jointSize;
        const rowShift = (row % 2) * (brickW * 0.5);

        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const shiftedX = (x + rowShift) % size;
          const localX = shiftedX % brickW;
          const isVertJoint = localX < jointSize;

          if (isHorizJoint || isVertJoint) {
            // Mortar joint with granular texture
            const mortarNoise = (pseudoNoise(x * 0.5, y * 0.5, 9) - 0.5) * 20;
            data[idx] = Math.min(255, Math.max(0, Math.round(cJoint[0] + mortarNoise)));
            data[idx + 1] = Math.min(255, Math.max(0, Math.round(cJoint[1] + mortarNoise)));
            data[idx + 2] = Math.min(255, Math.max(0, Math.round(cJoint[2] + mortarNoise)));
            data[idx + 3] = 255;
            continue;
          }

          // Brick face variation and porous clay inclusions
          const brickId = row * cols + Math.floor(shiftedX / brickW);
          const brickToneShift = (pseudoNoise(brickId, 0, 77) - 0.5) * 0.3;
          const surfaceRoughness = (fbm(x / 20, y / 20, 3, brickId * 5) - 0.5) * 25;
          const pore = pseudoNoise(x * 0.3, y * 0.3, 11) > 0.94 ? -35 : 0;

          const t = Math.max(0, Math.min(1, 0.5 + brickToneShift));
          const baseColor = lerpColor(c1, c2, t);

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + surfaceRoughness + pore)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + surfaceRoughness + pore)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + surfaceRoughness + pore)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'tiles': {
      // Ceramic or porcelain grid tiles with grout
      const tileCount = 6;
      const tileSize = size / tileCount;
      const groutSize = Math.max(2, Math.floor(size * 0.008));

      for (let y = 0; y < size; y++) {
        const localY = y % tileSize;
        const isHorizGrout = localY < groutSize;

        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const localX = x % tileSize;
          const isVertGrout = localX < groutSize;

          if (isHorizGrout || isVertGrout) {
            data[idx] = cJoint[0];
            data[idx + 1] = cJoint[1];
            data[idx + 2] = cJoint[2];
            data[idx + 3] = 255;
            continue;
          }

          // Tile surface subtle gradient and glaze variation
          const nx = localX / tileSize;
          const ny = localY / tileSize;
          const centerDist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 1.4;
          const glazeNoise = (fbm(x / 40, y / 40, 2, 4) - 0.5) * 10;

          const baseColor = lerpColor(c1, c2, centerDist * 0.3);
          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + glazeNoise)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + glazeNoise)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + glazeNoise)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'metal_brushed': {
      // Brushed anisotropic metallic surface with fine directional scratch lines
      for (let y = 0; y < size; y++) {
        const lineVariation = (pseudoNoise(0, y * 1.5, 33) - 0.5) * 40;
        const macroSheen = Math.sin((y / size) * Math.PI * 2) * 15;

        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const microStreak = (pseudoNoise(0, (y + x * 0.02) * 2, 88) - 0.5) * 20;
          const grit = (pseudoNoise(x, y, 19) - 0.5) * 8;

          const totalDelta = lineVariation + macroSheen + microStreak + grit;
          const baseColor = lerpColor(c1, c2, 0.5);

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + totalDelta)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + totalDelta)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + totalDelta)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'fabric_weave': {
      // Textile weave with interlacing warp and weft fibers
      const threadSize = Math.max(3, Math.floor(size / 64));

      for (let y = 0; y < size; y++) {
        const threadY = Math.floor(y / threadSize);
        const inThreadY = (y % threadSize) / threadSize;
        const curveY = Math.sin(inThreadY * Math.PI);

        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const threadX = Math.floor(x / threadSize);
          const inThreadX = (x % threadSize) / threadSize;
          const curveX = Math.sin(inThreadX * Math.PI);

          const isWarpOver = (threadX + threadY) % 2 === 0;
          const threadShade = isWarpOver ? curveX * 0.9 : curveY * 0.7;
          const fiberNoise = (pseudoNoise(x, y, 71) - 0.5) * 15;

          const baseColor = isWarpOver ? c1 : c2;
          const factor = 0.75 + threadShade * 0.35;

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] * factor + fiberNoise)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] * factor + fiberNoise)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] * factor + fiberNoise)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'leather': {
      // Natural leather with cellular grain / cracks
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const cellX = (x / 14);
          const cellY = (y / 14);
          const n1 = fbm(cellX, cellY, 3, 15);
          const crack = Math.pow(Math.abs(Math.sin((cellX * 1.8 + cellY * 1.2 + n1 * 2) * Math.PI)), 5);
          const micro = (fbm(x / 5, y / 5, 2, 88) - 0.5) * 15;

          const baseColor = lerpColor(c1, c2, n1);
          const shadow = 0.8 + crack * 0.25;

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] * shadow + micro)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] * shadow + micro)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] * shadow + micro)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'granite': {
      // Granite with quartz crystals, feldspar grains, and mica flakes
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const feldspar = pseudoNoise(x * 0.45, y * 0.45, 12);
          const quartz = pseudoNoise(x * 0.3, y * 0.3, 44);
          const mica = pseudoNoise(x * 0.9, y * 0.9, 99) > 0.92;

          let col: [number, number, number];
          if (mica) {
            col = cHighlight as [number, number, number];
          } else if (quartz > 0.65) {
            col = lerpColor(c1, cJoint, 0.4);
          } else if (feldspar > 0.7) {
            col = c2;
          } else {
            col = c1;
          }

          const grain = (pseudoNoise(x, y, 7) - 0.5) * 12;
          data[idx] = Math.min(255, Math.max(0, Math.round(col[0] + grain)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(col[1] + grain)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(col[2] + grain)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'concrete': {
      // Architectural exposed concrete with air bubbles and aggregate
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const macro = fbm(x / 120, y / 120, 4, 21);
          const micro = fbm(x / 14, y / 14, 3, 53);
          const grit = (pseudoNoise(x, y, 7) - 0.5) * 14;
          const pore = pseudoNoise(x * 0.18, y * 0.18, 91) > 0.98 ? -45 : 0;

          const t = Math.max(0, Math.min(1, (macro - 0.5) * 0.6 + (micro - 0.5) * 0.4 + 0.5));
          const baseColor = lerpColor(c1, c2, t);

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + grit + pore)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + grit + pore)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + grit + pore)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'asphalt': {
      // Dense asphalt bitumen with aggregate stones
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const aggregate = (pseudoNoise(x * 0.7, y * 0.7, 33) - 0.5) * 45;
          const tar = pseudoNoise(x * 0.15, y * 0.15, 11) > 0.88 ? -22 : 0;
          const speckle = pseudoNoise(x, y, 99) > 0.93 ? 65 : 0;
          const macro = (fbm(x / 40, y / 40, 3, 62) - 0.5) * 18;

          const baseColor = lerpColor(c1, c2, 0.5);
          const delta = aggregate + tar + speckle + macro;

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + delta)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + delta * 0.95)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + delta * 0.9)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'vegetation': {
      // Lush grass blades and foliage
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const bladeAngle = Math.sin((x * 0.8 + y * 0.1) + fbm(x / 25, y / 25, 3, 14) * 4);
          const bladeHighlight = Math.pow(Math.max(0, bladeAngle), 4) * 60;
          const soilPore = pseudoNoise(x * 0.2, y * 0.2, 5) > 0.95 ? -35 : 0;

          const baseColor = lerpColor(c1, c2, (bladeAngle + 1) * 0.5);
          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] * 0.85 + bladeHighlight * 0.4 + soilPore)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + bladeHighlight + soilPore)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] * 0.7 + bladeHighlight * 0.2 + soilPore)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'water_waves': {
      // Rippled water with caustics
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const wave1 = Math.sin(x * 0.04 + y * 0.02 + fbm(x / 40, y / 40, 3, 11) * 3);
          const wave2 = Math.cos(x * 0.03 - y * 0.05 + fbm(x / 30, y / 30, 2, 22) * 2);
          const caustic = Math.pow(Math.abs(wave1 * wave2), 3) * 80;

          const baseColor = lerpColor(c1, c2, (wave1 + 1) * 0.5);
          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + caustic * 0.4)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + caustic * 0.8)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + caustic)));
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'generic': {
      // Clean generic neutral surface with no pattern or texture applied
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          data[idx] = c1[0];
          data[idx + 1] = c1[1];
          data[idx + 2] = c1[2];
          data[idx + 3] = 255;
        }
      }
      break;
    }

    case 'plaster_stucco':
    default: {
      // Stucco / Plaster with trowel marks and fine grit
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const trowel = Math.sin((x / 35 + y / 50 + fbm(x / 60, y / 60, 3, 9) * 3) * Math.PI) * 22;
          const micro = (fbm(x / 15, y / 15, 3, 77) - 0.5) * 18;
          const grit = (pseudoNoise(x, y, 101) - 0.5) * 10;

          const delta = trowel + micro + grit;
          const baseColor = lerpColor(c1, c2, 0.5);

          data[idx] = Math.min(255, Math.max(0, Math.round(baseColor[0] + delta)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseColor[1] + delta * 0.98)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseColor[2] + delta * 0.95)));
          data[idx + 3] = 255;
        }
      }
      break;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
