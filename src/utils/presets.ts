import { MaterialCategory, MaterialProperties } from '../types';

export interface MaterialPreset {
  id: string;
  name: string;
  namePt: string;
  category: MaterialCategory;
  description: string;
  properties: MaterialProperties;
  generatePattern: (ctx: CanvasRenderingContext2D, size: number) => void;
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Asfalto',
  'Concreto',
  'Gesso',
  'Granitos',
  'Líquidos',
  'Madeira',
  'Mármores',
  'MDF',
  'MDP',
  'Metal',
  'Papel de Parede',
  'Pavimentação',
  'Pedras',
  'Pinturas e Texturas',
  'Pisos e Revestimentos',
  'Plásticos e Borrachas',
  'Tecidos',
  'Vegetação',
];

/**
 * Noise helper functions for realistic procedural canvas textures
 */
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
    val += smoothNoise(x * freq, y * freq, seed + i * 17.1) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

/* =========================================================================
   Procedural Generator Functions
   ========================================================================= */

function generateAsphalt(ctx: CanvasRenderingContext2D, size: number, wet: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const baseTone = wet ? 35 : 65;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const aggregate = (pseudoNoise(x * 0.7, y * 0.7, 88) - 0.5) * (wet ? 25 : 45);
      const tarPore = pseudoNoise(x * 0.15, y * 0.15, 12) > 0.85 ? -18 : 0;
      const macro = (fbm(x / 40, y / 40, 3, 55) - 0.5) * 15;
      const speckle = pseudoNoise(x, y, 99) > 0.94 ? (wet ? 55 : 80) : 0;

      const v = Math.min(255, Math.max(10, Math.round(baseTone + aggregate + tarPore + macro + speckle)));
      d[idx] = v;
      d[idx + 1] = Math.round(v * (wet ? 0.98 : 0.96));
      d[idx + 2] = Math.round(v * (wet ? 1.02 : 0.92));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateConcrete(ctx: CanvasRenderingContext2D, size: number, polished: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const macro = fbm(x / 140, y / 140, 4, 101);
      const micro = fbm(x / 15, y / 15, 3, 202);
      const grit = pseudoNoise(x, y, 303);
      const isPore = !polished && pseudoNoise(x * 0.2, y * 0.2, 404) > 0.985;
      const poreDarken = isPore ? 55 : 0;

      const baseVal = polished ? 175 : 145;
      const grey = Math.min(
        240,
        Math.max(
          40,
          Math.round(baseVal + (macro - 0.5) * (polished ? 25 : 50) + (micro - 0.5) * (polished ? 15 : 35) + (grit - 0.5) * 15 - poreDarken)
        )
      );

      d[idx] = grey;
      d[idx + 1] = Math.round(grey * 0.98);
      d[idx + 2] = Math.round(grey * 0.96);
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generatePlaster(ctx: CanvasRenderingContext2D, size: number, stucco: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const trowel = stucco ? Math.sin((x / 30 + y / 45 + fbm(x / 60, y / 60, 3, 7) * 4) * Math.PI) * 18 : 0;
      const micro = (fbm(x / 12, y / 12, 3, 91) - 0.5) * (stucco ? 22 : 8);
      const val = Math.min(255, Math.max(180, Math.round(235 + trowel + micro)));

      d[idx] = val;
      d[idx + 1] = Math.round(val * 0.99);
      d[idx + 2] = Math.round(val * 0.97);
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateGranite(ctx: CanvasRenderingContext2D, size: number, dark: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const feldspar = pseudoNoise(x * 0.5, y * 0.5, 33);
      const quartz = pseudoNoise(x * 0.35, y * 0.35, 77);
      const mica = pseudoNoise(x, y, 99) > 0.95 ? 1 : 0;

      let r: number, g: number, b: number;
      if (dark) {
        // Black granite with silver and white flecks
        const base = 25 + quartz * 25;
        r = base + (feldspar > 0.8 ? 90 : 0) + mica * 130;
        g = base + (feldspar > 0.8 ? 95 : 0) + mica * 140;
        b = base + (feldspar > 0.8 ? 100 : 0) + mica * 150;
      } else {
        // Grey granite (Corumbá)
        const base = 130 + quartz * 45;
        const isDarkMineral = feldspar < 0.25;
        const darkDrop = isDarkMineral ? 90 : 0;
        r = Math.max(20, base - darkDrop + mica * 50);
        g = Math.max(20, (base - 5) - darkDrop + mica * 50);
        b = Math.max(20, (base - 8) - darkDrop + mica * 55);
      }

      d[idx] = Math.min(255, Math.max(0, Math.round(r)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateLiquid(ctx: CanvasRenderingContext2D, size: number, darkOil: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const wave1 = Math.sin(x * 0.04 + y * 0.02 + fbm(x / 40, y / 40, 3, 11) * 3);
      const wave2 = Math.cos(x * 0.03 - y * 0.05 + fbm(x / 30, y / 30, 2, 22) * 2);
      const caustic = Math.pow(Math.abs(wave1 * wave2), 3) * 80;

      if (darkOil) {
        d[idx] = Math.min(255, Math.round(15 + caustic * 0.2));
        d[idx + 1] = Math.min(255, Math.round(20 + caustic * 0.3));
        d[idx + 2] = Math.min(255, Math.round(25 + caustic * 0.5));
      } else {
        // Clear tropical cyan/blue water
        d[idx] = Math.min(255, Math.round(30 + caustic * 0.8));
        d[idx + 1] = Math.min(255, Math.round(130 + caustic * 0.9));
        d[idx + 2] = Math.min(255, Math.round(200 + caustic));
      }
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateWood(ctx: CanvasRenderingContext2D, size: number, type: 'oak' | 'walnut' | 'weathered') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const numPlanks = type === 'weathered' ? 6 : 5;
  const plankH = size / numPlanks;

  for (let y = 0; y < size; y++) {
    const plankIdx = Math.floor(y / plankH);
    const isSeam = (y % plankH) < 3 || (y % plankH) > plankH - 3;

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      if (isSeam) {
        d[idx] = 35;
        d[idx + 1] = 22;
        d[idx + 2] = 14;
        d[idx + 3] = 255;
        continue;
      }

      const grainX = x * 0.04;
      const grainY = (y - plankIdx * plankH) * 0.25;
      const noiseGrain = fbm(grainX, grainY, 4, 33 + plankIdx * 10);
      const woodRings = Math.sin(grainY * 2.5 + noiseGrain * 5.0);

      let r = 0, g = 0, b = 0;
      if (type === 'oak') {
        r = 180 + woodRings * 25 + noiseGrain * 30;
        g = 120 + woodRings * 20 + noiseGrain * 20;
        b = 65 + woodRings * 12 + noiseGrain * 10;
      } else if (type === 'walnut') {
        r = 85 + woodRings * 18 + noiseGrain * 20;
        g = 52 + woodRings * 12 + noiseGrain * 15;
        b = 32 + woodRings * 8 + noiseGrain * 10;
      } else {
        // Weathered demolition grey wood
        const grey = 135 + woodRings * 20 + noiseGrain * 35;
        r = grey * 0.95;
        g = grey * 0.92;
        b = grey * 0.88;
      }

      d[idx] = Math.min(255, Math.max(0, Math.round(r)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateMarble(ctx: CanvasRenderingContext2D, size: number, type: 'carrara' | 'nero' | 'travertine') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const scale = size / 600;

      if (type === 'travertine') {
        const bands = Math.sin((y / (35 * scale) + fbm(x / 80, y / 40, 3, 14) * 2.5) * Math.PI);
        const pore = pseudoNoise(x * 0.1, y * 0.5, 99) > 0.92 ? -35 : 0;
        const tone = 210 + bands * 20 + pore;
        d[idx] = Math.min(255, Math.max(0, Math.round(tone)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(tone * 0.93)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(tone * 0.82)));
        d[idx + 3] = 255;
        continue;
      }

      const turb = fbm(x / (120 * scale), y / (120 * scale), 5, 88);
      const vein = Math.sin((x / (70 * scale) + y / (90 * scale) + turb * 4.0) * Math.PI);
      const veinIntensity = Math.pow(Math.abs(vein), 12);

      if (type === 'nero') {
        // Black marble with white/gold veins
        const baseDark = 22 + fbm(x / 60, y / 60, 3, 22) * 12;
        const veinCol = 240;
        d[idx] = Math.round(baseDark * (1 - veinIntensity) + veinCol * veinIntensity);
        d[idx + 1] = Math.round(baseDark * (1 - veinIntensity) + (veinCol - 15) * veinIntensity);
        d[idx + 2] = Math.round(baseDark * (1 - veinIntensity) + (veinCol - 40) * veinIntensity);
      } else {
        // White Carrara marble
        const baseWhite = 240 + fbm(x / 60, y / 60, 3, 22) * 12;
        const veinColor = 80 + fbm(x / 30, y / 30, 2, 44) * 40;
        d[idx] = Math.round(baseWhite * (1 - veinIntensity * 0.65) + veinColor * (veinIntensity * 0.65));
        d[idx + 1] = Math.round((baseWhite - 2) * (1 - veinIntensity * 0.65) + (veinColor + 3) * (veinIntensity * 0.65));
        d[idx + 2] = Math.round((baseWhite - 5) * (1 - veinIntensity * 0.65) + (veinColor + 8) * (veinIntensity * 0.65));
      }
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateMDF(ctx: CanvasRenderingContext2D, size: number, graphite: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const microFibers = (pseudoNoise(x * 0.6, y * 0.6, 44) - 0.5) * (graphite ? 10 : 25);
      const pressTexture = (fbm(x / 20, y / 20, 3, 81) - 0.5) * 15;

      let r: number, g: number, b: number;
      if (graphite) {
        const val = 50 + microFibers + pressTexture;
        r = val;
        g = val * 1.02;
        b = val * 1.05;
      } else {
        // Raw MDF tan wood pulp
        const val = 185 + microFibers + pressTexture;
        r = val;
        g = val * 0.84;
        b = val * 0.64;
      }

      d[idx] = Math.min(255, Math.max(0, Math.round(r)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateMDP(ctx: CanvasRenderingContext2D, size: number, melamine: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const chipParticle = (pseudoNoise(x * 0.3, y * 0.3, 17) - 0.5) * (melamine ? 12 : 55);
      const speckle = pseudoNoise(x, y, 73) * 15;

      let r: number, g: number, b: number;
      if (melamine) {
        // Melamine white with microscopic matte texture
        const val = 225 + chipParticle + speckle;
        r = val;
        g = val;
        b = val * 0.98;
      } else {
        // Raw coarse particle board
        const val = 165 + chipParticle + speckle;
        r = val;
        g = val * 0.82;
        b = val * 0.6;
      }

      d[idx] = Math.min(255, Math.max(0, Math.round(r)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateMetal(ctx: CanvasRenderingContext2D, size: number, type: 'steel' | 'copper' | 'castiron') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    const rowNoise = type === 'steel' ? fbm(y / 8, 0, 3, 55) * 60 : 0;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      if (type === 'steel') {
        const streak = (pseudoNoise(x * 0.05, y, 77) - 0.5) * 45;
        const val = Math.min(255, Math.max(0, Math.round(165 + rowNoise * 0.4 + streak)));
        d[idx] = val;
        d[idx + 1] = Math.min(255, Math.round(val * 1.02));
        d[idx + 2] = Math.min(255, Math.round(val * 1.05));
      } else if (type === 'copper') {
        const shine = Math.sin((x + y) * 0.02) * 20;
        const grain = (fbm(x / 20, y / 20, 3, 19) - 0.5) * 25;
        d[idx] = Math.min(255, Math.max(0, Math.round(215 + shine + grain)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(115 + shine * 0.6 + grain * 0.6)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(80 + shine * 0.4 + grain * 0.4)));
      } else {
        // Cast iron
        const pucker = (fbm(x / 10, y / 10, 4, 61) - 0.5) * 60;
        const val = Math.min(255, Math.max(20, Math.round(65 + pucker)));
        d[idx] = val;
        d[idx + 1] = val;
        d[idx + 2] = val;
      }
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateWallpaper(ctx: CanvasRenderingContext2D, size: number, deco: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const grid = Math.max(16, Math.round(size / 16));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let pattern = 0;

      if (deco) {
        // Art Deco diamond geometric
        const mx = (x % grid) - grid / 2;
        const my = (y % grid) - grid / 2;
        const dist = Math.abs(mx) + Math.abs(my);
        pattern = dist < grid * 0.35 && dist > grid * 0.2 ? 65 : 0;
      } else {
        // Textured vinyl wallpaper
        const weave = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 25;
        pattern = weave;
      }

      // Emerald / Gold tint or Neutral luxury wallpaper
      const baseR = deco ? 35 : 210;
      const baseG = deco ? 60 : 205;
      const baseB = deco ? 55 : 195;

      d[idx] = Math.min(255, Math.max(0, Math.round(baseR + pattern * 1.2)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(baseG + pattern * 1.0)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(baseB + pattern * 0.5)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generatePaving(ctx: CanvasRenderingContext2D, size: number, cobblestone: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const unitSize = cobblestone ? Math.max(20, Math.round(size / 12)) : Math.max(18, Math.round(size / 10));

  for (let y = 0; y < size; y++) {
    const row = Math.floor(y / unitSize);
    const rowOffset = (row % 2) * (unitSize * 0.5);
    const inGroutY = (y % unitSize) < 4 || (y % unitSize) > unitSize - 4;

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const adjustedX = x + rowOffset;
      const col = Math.floor(adjustedX / unitSize);
      const inGroutX = (adjustedX % unitSize) < 4 || (adjustedX % unitSize) > unitSize - 4;

      if (inGroutX || inGroutY) {
        // Grout / sand line
        d[idx] = 60;
        d[idx + 1] = 55;
        d[idx + 2] = 48;
        d[idx + 3] = 255;
        continue;
      }

      const seed = row * 19 + col * 37;
      const stoneNoise = (fbm((x + seed) / 20, (y + seed) / 20, 3, 11) - 0.5) * 40;
      const baseTone = cobblestone ? 120 : 155;

      const r = baseTone + stoneNoise;
      const g = baseTone * 0.96 + stoneNoise;
      const b = baseTone * 0.92 + stoneNoise;

      d[idx] = Math.min(255, Math.max(0, Math.round(r)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateStone(ctx: CanvasRenderingContext2D, size: number, type: 'brick' | 'sandstone' | 'pebble') {
  if (type === 'brick') {
    const rows = 12;
    const cols = 6;
    const brickH = size / rows;
    const brickW = size / cols;
    const mortar = Math.max(3, Math.round(size * 0.015));

    ctx.fillStyle = '#6b665f';
    ctx.fillRect(0, 0, size, size);

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (brickW * 0.5);
      for (let c = -1; c <= cols + 1; c++) {
        const bx = c * brickW + offset;
        const by = r * brickH;
        const brickSeed = r * 13 + c * 29;
        const toneR = 150 + Math.floor(pseudoNoise(brickSeed, 1) * 60);
        const toneG = 45 + Math.floor(pseudoNoise(brickSeed, 2) * 35);
        const toneB = 25 + Math.floor(pseudoNoise(brickSeed, 3) * 25);

        ctx.fillStyle = `rgb(${toneR}, ${toneG}, ${toneB})`;
        ctx.fillRect(bx + mortar, by + mortar, brickW - mortar * 2, brickH - mortar * 2);
      }
    }

    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n = (fbm(x / 40, y / 40, 4, 11) - 0.5) * 60;
        const micro = (pseudoNoise(x, y, 99) - 0.5) * 35;
        d[idx] = Math.min(255, Math.max(0, d[idx] + n + micro));
        d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + n * 0.7 + micro * 0.7));
        d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + n * 0.5 + micro * 0.5));
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else {
    // Sandstone / Pebble
    const imgData = ctx.createImageData(size, size);
    const d = imgData.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const layers = Math.sin((y / 25 + fbm(x / 50, y / 20, 3, 44) * 3) * Math.PI) * 35;
        const grain = (pseudoNoise(x, y, 82) - 0.5) * 30;
        const base = 190 + layers + grain;
        d[idx] = Math.min(255, Math.max(0, Math.round(base)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(base * 0.88)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(base * 0.72)));
        d[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }
}

function generateTexturePaint(ctx: CanvasRenderingContext2D, size: number, grafiato: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const scratch = grafiato
        ? (pseudoNoise(Math.floor((x + y * 0.3) / 6), y, 51) > 0.88 ? -45 : 0)
        : 0;
      const aggregate = (fbm(x / 14, y / 14, 3, 73) - 0.5) * (grafiato ? 35 : 12);
      const baseTone = 205 + scratch + aggregate;

      d[idx] = Math.min(255, Math.max(0, Math.round(baseTone)));
      d[idx + 1] = Math.min(255, Math.max(0, Math.round(baseTone * 0.98)));
      d[idx + 2] = Math.min(255, Math.max(0, Math.round(baseTone * 0.95)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateTile(ctx: CanvasRenderingContext2D, size: number, hexagonal: boolean) {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const tileSize = Math.max(32, Math.round(size / 8));

  for (let y = 0; y < size; y++) {
    const isGroutY = (y % tileSize) < 3;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const isGroutX = (x % tileSize) < 3;

      if (isGroutX || isGroutY) {
        d[idx] = 90;
        d[idx + 1] = 90;
        d[idx + 2] = 90;
        d[idx + 3] = 255;
        continue;
      }

      // Satin glazed subtle gradient
      const grad = Math.sin((x % tileSize) / tileSize * Math.PI) * Math.sin((y % tileSize) / tileSize * Math.PI) * 15;
      const micro = (pseudoNoise(x, y, 12) - 0.5) * 8;
      const val = Math.min(255, Math.max(0, Math.round(230 + grad + micro)));

      d[idx] = val;
      d[idx + 1] = val;
      d[idx + 2] = Math.min(255, Math.round(val * 1.02));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateRubberPlastic(ctx: CanvasRenderingContext2D, size: number, type: 'coin' | 'abs') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  const pitch = Math.max(24, Math.round(size / 16));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      if (type === 'coin') {
        const cx = (x % pitch) - pitch / 2;
        const cy = (y % pitch) - pitch / 2;
        const r = Math.sqrt(cx * cx + cy * cy);
        const isStud = r < pitch * 0.38;
        const edge = Math.abs(r - pitch * 0.38) < 2;
        const base = isStud ? 50 : 30;
        const val = edge ? 70 : base + (pseudoNoise(x, y, 9) - 0.5) * 8;
        d[idx] = Math.min(255, Math.max(0, Math.round(val)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(val)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(val * 1.05)));
      } else {
        // Matte technical ABS plastic
        const micro = (pseudoNoise(x * 0.8, y * 0.8, 47) - 0.5) * 12;
        const val = 42 + micro;
        d[idx] = Math.min(255, Math.max(0, Math.round(val)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(val)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(val)));
      }
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateFabricLeather(ctx: CanvasRenderingContext2D, size: number, type: 'linen' | 'leather') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  if (type === 'linen') {
    const threadPitch = Math.max(6, Math.round(size / 64));
    for (let y = 0; y < size; y++) {
      const rowMod = (y % threadPitch) / threadPitch;
      const threadY = Math.sin(rowMod * Math.PI);
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const colMod = (x % threadPitch) / threadPitch;
        const threadX = Math.sin(colMod * Math.PI);
        const cellX = Math.floor(x / threadPitch);
        const cellY = Math.floor(y / threadPitch);
        const isWarp = (cellX + cellY) % 2 === 0;
        const threadProfile = isWarp ? threadX : threadY;
        const fibreNoise = (pseudoNoise(x, y, 71) - 0.5) * 25;
        const baseTone = 195 + threadProfile * 35 + fibreNoise;

        d[idx] = Math.min(255, Math.max(0, Math.round(baseTone)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(baseTone * 0.92)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(baseTone * 0.82)));
        d[idx + 3] = 255;
      }
    }
  } else {
    // Leather
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const cellNoise = fbm(x / 18, y / 18, 4, 88);
        const wrinkle = Math.sin(x / 60 + y / 50 + cellNoise * 3) * 0.2;
        const pore = Math.sin(cellNoise * 15) > 0.6 ? -25 : 10;
        d[idx] = Math.min(255, Math.max(0, Math.round(115 + cellNoise * 40 + wrinkle * 30 + pore)));
        d[idx + 1] = Math.min(255, Math.max(0, Math.round(65 + cellNoise * 25 + wrinkle * 20 + pore * 0.8)));
        d[idx + 2] = Math.min(255, Math.max(0, Math.round(35 + cellNoise * 15 + wrinkle * 10 + pore * 0.5)));
        d[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function generateVegetation(ctx: CanvasRenderingContext2D, size: number, type: 'grass' | 'moss') {
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const blade = (fbm(x / 8, y / 16, 4, 91) - 0.5) * 60;
      const soil = pseudoNoise(x * 0.2, y * 0.2, 13) > 0.9 ? -40 : 0;
      const baseG = type === 'grass' ? 145 : 110;

      d[idx] = Math.min(255, Math.max(10, Math.round(45 + blade * 0.5 + soil)));
      d[idx + 1] = Math.min(255, Math.max(20, Math.round(baseG + blade + soil)));
      d[idx + 2] = Math.min(255, Math.max(5, Math.round(25 + blade * 0.3 + soil * 0.5)));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/* =========================================================================
   Comprehensive Materials Presets by Category (Alphabetical)
   ========================================================================= */

export const MATERIAL_PRESETS: MaterialPreset[] = [
  // 1. Asfalto
  {
    id: 'asfalto-rodoviario',
    name: 'Granular Highway Asphalt',
    namePt: 'Asfalto Rodoviário Granulado',
    category: 'Asfalto',
    description: 'Camada asfáltica densa com agregados de brita e betume fosco.',
    properties: {
      name: 'Asfalto Rodoviário Granulado',
      category: 'Asfalto',
      description: 'Pavimento asfáltico rodoviário com grânulos minerais e alta porosidade superficial.',
      ior: 1.53,
      metallic: 0.0,
      baseRoughness: 0.88,
      specularLevel: 0.28,
      displacementScale: 0.03,
      normalStrength: 3.0,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateAsphalt(ctx, size, false),
  },
  {
    id: 'asfalto-molhado',
    name: 'Wet Urban Asphalt',
    namePt: 'Asfalto Urbano Molhado',
    category: 'Asfalto',
    description: 'Pista asfáltica escura molhada com poças e reflexo especular agudo.',
    properties: {
      name: 'Asfalto Urbano Molhado',
      category: 'Asfalto',
      description: 'Superfície de asfalto recém-chovida com reflexos luminosos e água em depressões.',
      ior: 1.333,
      metallic: 0.0,
      baseRoughness: 0.22,
      specularLevel: 0.85,
      displacementScale: 0.02,
      normalStrength: 2.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateAsphalt(ctx, size, true),
  },

  // 2. Concreto
  {
    id: 'aged-concrete',
    name: 'Architectural Raw Concrete',
    namePt: 'Concreto Aparente Bruto',
    category: 'Concreto',
    description: 'Concreto arquitetônico com agregados miúdos, furos de bolhas de ar e manchas sutis de cura.',
    properties: {
      name: 'Concreto Aparente Bruto',
      category: 'Concreto',
      description: 'Painel de concreto de obra com textura mineral porosa e aspecto moderno.',
      ior: 1.52,
      metallic: 0.0,
      baseRoughness: 0.78,
      specularLevel: 0.3,
      displacementScale: 0.035,
      normalStrength: 2.8,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateConcrete(ctx, size, false),
  },
  {
    id: 'concreto-polido',
    name: 'Polished Industrial Concrete',
    namePt: 'Concreto Polido Industrial',
    category: 'Concreto',
    description: 'Piso de concreto usinado com acabamento resinado brilhante para galpões e lofts.',
    properties: {
      name: 'Concreto Polido Industrial',
      category: 'Concreto',
      description: 'Superfície mineral nivelada com selador epóxi acetinado.',
      ior: 1.5,
      metallic: 0.0,
      baseRoughness: 0.28,
      specularLevel: 0.65,
      displacementScale: 0.008,
      normalStrength: 1.4,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateConcrete(ctx, size, true),
  },

  // 3. Gesso
  {
    id: 'gesso-liso',
    name: 'Smooth Drywall Plaster',
    namePt: 'Gesso Acartonado Liso',
    category: 'Gesso',
    description: 'Placa de gesso lisa com microrrelevo acetinado homogêneo para forros e paredes internas.',
    properties: {
      name: 'Gesso Acartonado Liso',
      category: 'Gesso',
      description: 'Acabamento interno uniforme com baixa reflexão e aspecto aveludado.',
      ior: 1.42,
      metallic: 0.0,
      baseRoughness: 0.82,
      specularLevel: 0.22,
      displacementScale: 0.005,
      normalStrength: 1.1,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generatePlaster(ctx, size, false),
  },
  {
    id: 'estuque-veneziano',
    name: 'Textured Venetian Stucco Plaster',
    namePt: 'Estuque Texturizado com Espátula',
    category: 'Gesso',
    description: 'Revestimento de gesso e cal com marcas artesanais de desempenadeira metálica.',
    properties: {
      name: 'Estuque Texturizado com Espátula',
      category: 'Gesso',
      description: 'Paredes clássicas com nuances artísticas e relevo tátil orgânico.',
      ior: 1.45,
      metallic: 0.0,
      baseRoughness: 0.55,
      specularLevel: 0.45,
      displacementScale: 0.018,
      normalStrength: 2.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generatePlaster(ctx, size, true),
  },

  // 4. Granitos
  {
    id: 'granito-cinza',
    name: 'Grey Corumbá Granite',
    namePt: 'Granito Cinza Corumbá',
    category: 'Granitos',
    description: 'Rocha ígnea polida com grânulos de quartzo, feldspato e biotita preta.',
    properties: {
      name: 'Granito Cinza Corumbá',
      category: 'Granitos',
      description: 'Pancada mineral resistente com alta densidade e reflexo vitrificado.',
      ior: 1.58,
      metallic: 0.0,
      baseRoughness: 0.16,
      specularLevel: 0.8,
      displacementScale: 0.01,
      normalStrength: 1.6,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateGranite(ctx, size, false),
  },
  {
    id: 'granito-preto',
    name: 'Black São Gabriel Granite',
    namePt: 'Granito Preto São Gabriel',
    category: 'Granitos',
    description: 'Granito negro intenso polido com micropontos reflexivos cristalinos.',
    properties: {
      name: 'Granito Preto São Gabriel',
      category: 'Granitos',
      description: 'Bancadas requintadas com espelhamento nítido e fundo escuro profundo.',
      ior: 1.62,
      metallic: 0.0,
      baseRoughness: 0.14,
      specularLevel: 0.88,
      displacementScale: 0.008,
      normalStrength: 1.3,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateGranite(ctx, size, true),
  },

  // 5. Líquidos
  {
    id: 'agua-cristalina',
    name: 'Rippled Clear Water',
    namePt: 'Água Cristalina Ondulada',
    category: 'Líquidos',
    description: 'Lâmina d’água límpida com perturbações fluidas e reflexo translúcido.',
    properties: {
      name: 'Água Cristalina Ondulada',
      category: 'Líquidos',
      description: 'Superfície de piscina ou lago com refração natural e cáusticas dinâmicas.',
      ior: 1.333,
      metallic: 0.0,
      baseRoughness: 0.05,
      specularLevel: 0.95,
      displacementScale: 0.04,
      normalStrength: 2.6,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.25,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateLiquid(ctx, size, false),
  },
  {
    id: 'oleo-viscoso',
    name: 'Dark Viscous Oil',
    namePt: 'Líquido Viscoso / Óleo Escuro',
    category: 'Líquidos',
    description: 'Fluido denso lubrificante com ondas lentas e alto coeficiente de reflexão.',
    properties: {
      name: 'Líquido Viscoso / Óleo Escuro',
      category: 'Líquidos',
      description: 'Petróleo ou óleo mineral industrial com película suave de alta viscosidade.',
      ior: 1.48,
      metallic: 0.1,
      baseRoughness: 0.08,
      specularLevel: 0.92,
      displacementScale: 0.025,
      normalStrength: 2.0,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.25,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateLiquid(ctx, size, true),
  },

  // 6. Madeira
  {
    id: 'oak-wood',
    name: 'Natural Oak Wood Planks',
    namePt: 'Madeira Carvalho Maciço',
    category: 'Madeira',
    description: 'Tábuas de carvalho natural com anéis de crescimento visíveis e acabamento acetinado.',
    properties: {
      name: 'Madeira Carvalho Maciço',
      category: 'Madeira',
      description: 'Pranchas de carvalho europeu com textura fibrosa e relevo suave nas ranhuras.',
      ior: 1.51,
      metallic: 0.0,
      baseRoughness: 0.38,
      specularLevel: 0.45,
      displacementScale: 0.02,
      normalStrength: 2.1,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateWood(ctx, size, 'oak'),
  },
  {
    id: 'madeira-nogueira',
    name: 'Dark Walnut Wood',
    namePt: 'Madeira Nogueira Escura',
    category: 'Madeira',
    description: 'Madeira escura de nogueira com tonalidade marrom chocolate e fibras finas.',
    properties: {
      name: 'Madeira Nogueira Escura',
      category: 'Madeira',
      description: 'Mobiliário premium de alta marcenaria com verniz semi-brilho.',
      ior: 1.52,
      metallic: 0.0,
      baseRoughness: 0.32,
      specularLevel: 0.52,
      displacementScale: 0.018,
      normalStrength: 1.9,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateWood(ctx, size, 'walnut'),
  },
  {
    id: 'madeira-demolicao',
    name: 'Reclaimed Demolition Wood',
    namePt: 'Madeira Rústica de Demolição',
    category: 'Madeira',
    description: 'Pranchas envelhecidas pelo tempo com ranhuras profundas e aspecto acinzentado.',
    properties: {
      name: 'Madeira Rústica de Demolição',
      category: 'Madeira',
      description: 'Tábua antiga de galpão com veios abertos e relevo pronunciado.',
      ior: 1.53,
      metallic: 0.0,
      baseRoughness: 0.85,
      specularLevel: 0.25,
      displacementScale: 0.045,
      normalStrength: 3.4,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateWood(ctx, size, 'weathered'),
  },

  // 7. Mármores
  {
    id: 'carrara-marble',
    name: 'Polished Carrara Marble',
    namePt: 'Mármore Carrara Polido',
    category: 'Mármores',
    description: 'Mármore nobre branco com veios orgânicos acinzentados e reflexo especular de alto brilho.',
    properties: {
      name: 'Mármore Carrara Polido',
      category: 'Mármores',
      description: 'Superfície de mármore italiano refinado com veios sinuosos finos e profundos.',
      ior: 1.486,
      metallic: 0.0,
      baseRoughness: 0.12,
      specularLevel: 0.85,
      displacementScale: 0.008,
      normalStrength: 1.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMarble(ctx, size, 'carrara'),
  },
  {
    id: 'nero-marquina',
    name: 'Black Nero Marquina Marble',
    namePt: 'Mármore Nero Marquina Preto',
    category: 'Mármores',
    description: 'Mármore negro profundo com veios contrastantes brancos e dourados.',
    properties: {
      name: 'Mármore Nero Marquina Preto',
      category: 'Mármores',
      description: 'Revestimento de luxo para arquitetura de interiores com acabamento espelhado.',
      ior: 1.5,
      metallic: 0.0,
      baseRoughness: 0.13,
      specularLevel: 0.88,
      displacementScale: 0.009,
      normalStrength: 1.3,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMarble(ctx, size, 'nero'),
  },
  {
    id: 'marmore-travertino',
    name: 'Roman Travertine Marble',
    namePt: 'Mármore Travertino Romano',
    category: 'Mármores',
    description: 'Mármore travertino bege com faixas estratificadas e cavidades naturais estucadas.',
    properties: {
      name: 'Mármore Travertino Romano',
      category: 'Mármores',
      description: 'Rocha sedimentar clássica romana para fachadas e pisos sofisticados.',
      ior: 1.49,
      metallic: 0.0,
      baseRoughness: 0.45,
      specularLevel: 0.4,
      displacementScale: 0.022,
      normalStrength: 2.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMarble(ctx, size, 'travertine'),
  },

  // 8. MDF
  {
    id: 'mdf-cru',
    name: 'Raw Pressed MDF Board',
    namePt: 'MDF Cru Prensado',
    category: 'MDF',
    description: 'Painel de fibras de média densidade prensadas a quente com aspecto aveludado ocre.',
    properties: {
      name: 'MDF Cru Prensado',
      category: 'MDF',
      description: 'Chapa de marcenaria homogênea sem veios, com micropartículas comprimidas.',
      ior: 1.48,
      metallic: 0.0,
      baseRoughness: 0.75,
      specularLevel: 0.25,
      displacementScale: 0.008,
      normalStrength: 1.4,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMDF(ctx, size, false),
  },
  {
    id: 'mdf-melaminico',
    name: 'Laminated Graphite MDF',
    namePt: 'MDF Melamínico Grafite',
    category: 'MDF',
    description: 'Chapa revestida com lâmina melamínica fosca antifluxo para armários planejados.',
    properties: {
      name: 'MDF Melamínico Grafite',
      category: 'MDF',
      description: 'MDF com acabamento BP acetinado de toque suave e proteção ultravioleta.',
      ior: 1.47,
      metallic: 0.0,
      baseRoughness: 0.42,
      specularLevel: 0.45,
      displacementScale: 0.004,
      normalStrength: 1.0,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMDF(ctx, size, true),
  },

  // 9. MDP
  {
    id: 'mdp-cru',
    name: 'Raw Particle Board Core (MDP)',
    namePt: 'MDP Cru Fibras Médias',
    category: 'MDP',
    description: 'Painel aglomerado de partículas de madeira em camadas diferenciadas.',
    properties: {
      name: 'MDP Cru Fibras Médias',
      category: 'MDP',
      description: 'Chapa estrutural de partículas de reflorestamento com granulometria visível.',
      ior: 1.49,
      metallic: 0.0,
      baseRoughness: 0.82,
      specularLevel: 0.22,
      displacementScale: 0.014,
      normalStrength: 2.0,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMDP(ctx, size, false),
  },
  {
    id: 'mdp-aglomerado',
    name: 'White Melamine Particle Board MDP',
    namePt: 'MDP Aglomerado Melamínico Branco',
    category: 'MDP',
    description: 'Chapa MDP revestida em ambas as faces com resina melamínica branca texturizada.',
    properties: {
      name: 'MDP Aglomerado Melamínico Branco',
      category: 'MDP',
      description: 'Padrão industrial amplamente empregado na confecção de móveis modulados.',
      ior: 1.46,
      metallic: 0.0,
      baseRoughness: 0.48,
      specularLevel: 0.38,
      displacementScale: 0.006,
      normalStrength: 1.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMDP(ctx, size, true),
  },

  // 10. Metal
  {
    id: 'brushed-metal',
    name: 'Industrial Brushed Steel',
    namePt: 'Aço Escovado Industrial',
    category: 'Metal',
    description: 'Placa metálica de aço inoxidável com estrias direcionais de usinagem.',
    properties: {
      name: 'Aço Escovado Industrial',
      category: 'Metal',
      description: 'Superfície de aço com ranhuras micro-escovadas horizontais de alta precisão.',
      ior: 2.75,
      metallic: 0.95,
      baseRoughness: 0.28,
      specularLevel: 0.95,
      displacementScale: 0.005,
      normalStrength: 1.8,
      normalFormat: 'DirectX',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMetal(ctx, size, 'steel'),
  },
  {
    id: 'cobre-polido',
    name: 'Polished Pure Copper',
    namePt: 'Cobre Nobre Polido',
    category: 'Metal',
    description: 'Chapa de cobre avermelhado com brilho metálico quente e reflexão intensa.',
    properties: {
      name: 'Cobre Nobre Polido',
      category: 'Metal',
      description: 'Metal nobre condutivo para luminárias, coifas e elementos de destaque decorativo.',
      ior: 2.45,
      metallic: 0.96,
      baseRoughness: 0.18,
      specularLevel: 0.92,
      displacementScale: 0.004,
      normalStrength: 1.3,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMetal(ctx, size, 'copper'),
  },
  {
    id: 'ferro-fundido',
    name: 'Rough Cast Iron',
    namePt: 'Ferro Fundido Rugoso',
    category: 'Metal',
    description: 'Ferro fundido cinzento com textura áspera de molde de areia e microcrateras.',
    properties: {
      name: 'Ferro Fundido Rugoso',
      category: 'Metal',
      description: 'Metal estrutural escuro com relevo táctil áspero e baixa reflexão direta.',
      ior: 2.8,
      metallic: 0.88,
      baseRoughness: 0.72,
      specularLevel: 0.5,
      displacementScale: 0.025,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateMetal(ctx, size, 'castiron'),
  },

  // 11. Papel de Parede
  {
    id: 'papel-parede-geometrico',
    name: 'Art Deco Geometric Wallpaper',
    namePt: 'Papel de Parede Geométrico Art Déco',
    category: 'Papel de Parede',
    description: 'Papel de parede vinílico com estampa geométrica em linhas douradas e relevo táctil.',
    properties: {
      name: 'Papel de Parede Geométrico Art Déco',
      category: 'Papel de Parede',
      description: 'Padrão geométrico repetível com detalhes metalizados discretos.',
      ior: 1.46,
      metallic: 0.12,
      baseRoughness: 0.62,
      specularLevel: 0.38,
      displacementScale: 0.012,
      normalStrength: 2.1,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 3,
    },
    generatePattern: (ctx, size) => generateWallpaper(ctx, size, true),
  },
  {
    id: 'papel-parede-linho',
    name: 'Textured Vinyl Wallpaper',
    namePt: 'Papel de Parede Vinílico Texturizado',
    category: 'Papel de Parede',
    description: 'Revestimento de parede lavável com relevo de trama suave e tom neutro.',
    properties: {
      name: 'Papel de Parede Vinílico Texturizado',
      category: 'Papel de Parede',
      description: 'Superfície fosca lavável com textura de toque agradável e absorção acústica.',
      ior: 1.45,
      metallic: 0.0,
      baseRoughness: 0.8,
      specularLevel: 0.26,
      displacementScale: 0.01,
      normalStrength: 1.8,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateWallpaper(ctx, size, false),
  },

  // 12. Pavimentação
  {
    id: 'paver-concreto',
    name: 'Interlocking Concrete Pavers',
    namePt: 'Paver Intertravado de Concreto',
    category: 'Pavimentação',
    description: 'Blocos de concreto prensado intertravados para calçadas e garagens.',
    properties: {
      name: 'Paver Intertravado de Concreto',
      category: 'Pavimentação',
      description: 'Piso drenante urbano com juntas preenchidas por areia e chanfros de borda.',
      ior: 1.52,
      metallic: 0.0,
      baseRoughness: 0.84,
      specularLevel: 0.28,
      displacementScale: 0.04,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generatePaving(ctx, size, false),
  },
  {
    id: 'paralelepipedo',
    name: 'Colonial Cobblestone Street',
    namePt: 'Paralelepípedo Urbano Colonial',
    category: 'Pavimentação',
    description: 'Calçamento tradicional de paralelepípedos de granito bruto polidos pelo tráfego.',
    properties: {
      name: 'Paralelepípedo Urbano Colonial',
      category: 'Pavimentação',
      description: 'Pavimentação histórica de pedras irregulares com relevo abaulado.',
      ior: 1.55,
      metallic: 0.0,
      baseRoughness: 0.65,
      specularLevel: 0.45,
      displacementScale: 0.055,
      normalStrength: 3.8,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generatePaving(ctx, size, true),
  },

  // 13. Pedras
  {
    id: 'rustic-brick',
    name: 'Rustic Red Brick Wall',
    namePt: 'Tijolo Rústico Envelhecido',
    category: 'Pedras',
    description: 'Parede de tijolos rústicos avermelhados com rejunte profundo de argamassa calcária.',
    properties: {
      name: 'Tijolo Rústico Envelhecido',
      category: 'Pedras',
      description: 'Parede de tijolos artesanais com textura irregular e argamassa desgastada.',
      ior: 1.54,
      metallic: 0.0,
      baseRoughness: 0.85,
      specularLevel: 0.35,
      displacementScale: 0.045,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateStone(ctx, size, 'brick'),
  },
  {
    id: 'pedra-sao-tome',
    name: 'Strip Sandstone Wall',
    namePt: 'Pedra São Tomé Filetada',
    category: 'Pedras',
    description: 'Revestimento em filetes de quartzo e arenito natural amarelo com estratos planos.',
    properties: {
      name: 'Pedra São Tomé Filetada',
      category: 'Pedras',
      description: 'Painel rústico de pedras cortadas em tiras para muros e lareiras.',
      ior: 1.53,
      metallic: 0.0,
      baseRoughness: 0.78,
      specularLevel: 0.3,
      displacementScale: 0.04,
      normalStrength: 3.0,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateStone(ctx, size, 'sandstone'),
  },

  // 14. Pinturas e Texturas
  {
    id: 'textura-grafiato',
    name: 'Scratched Acrylic Grafiato Wall',
    namePt: 'Textura Acrílica Grafiato',
    category: 'Pinturas e Texturas',
    description: 'Revestimento hidrorrepelente com ranhuras direcionais causadas por grãos de quartzo.',
    properties: {
      name: 'Textura Acrílica Grafiato',
      category: 'Pinturas e Texturas',
      description: 'Pintura texturizada para fachadas externas com sulcos marcantes e alta resistência.',
      ior: 1.48,
      metallic: 0.0,
      baseRoughness: 0.86,
      specularLevel: 0.22,
      displacementScale: 0.028,
      normalStrength: 2.8,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateTexturePaint(ctx, size, true),
  },
  {
    id: 'pintura-latex-fosca',
    name: 'Velvet Matte Latex Interior Paint',
    namePt: 'Pintura Látex Fosca Aveludada',
    category: 'Pinturas e Texturas',
    description: 'Tinta acrílica fosca para ambientes internos com dispersão de luz homogênea.',
    properties: {
      name: 'Pintura Látex Fosca Aveludada',
      category: 'Pinturas e Texturas',
      description: 'Paredes internas sem reflexo especular incômodo, com acabamento sedoso.',
      ior: 1.44,
      metallic: 0.0,
      baseRoughness: 0.9,
      specularLevel: 0.18,
      displacementScale: 0.005,
      normalStrength: 1.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateTexturePaint(ctx, size, false),
  },

  // 15. Pisos e Revestimentos
  {
    id: 'porcelanato-acetinado',
    name: 'Satin Glazed Porcelain Tile',
    namePt: 'Porcelanato Esmaltado Acetinado',
    category: 'Pisos e Revestimentos',
    description: 'Placas cerâmicas retificadas de porcelanato com juntas mínimas de 1mm.',
    properties: {
      name: 'Porcelanato Esmaltado Acetinado',
      category: 'Pisos e Revestimentos',
      description: 'Piso elegante para salas e banheiros com reflexo suave difuso e fácil limpeza.',
      ior: 1.51,
      metallic: 0.0,
      baseRoughness: 0.26,
      specularLevel: 0.72,
      displacementScale: 0.012,
      normalStrength: 1.7,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateTile(ctx, size, false),
  },
  {
    id: 'pastilha-hexagonal',
    name: 'Hexagonal Mosaic Tiles',
    namePt: 'Pastilhas Hexagonais Brancas',
    category: 'Pisos e Revestimentos',
    description: 'Mosaico de pastilhas cerâmicas hexagonais esmaltadas com rejunte escuro.',
    properties: {
      name: 'Pastilhas Hexagonais Brancas',
      category: 'Pisos e Revestimentos',
      description: 'Revestimento retrô contemporâneo com relevo côncavo nas bordas das peças.',
      ior: 1.5,
      metallic: 0.0,
      baseRoughness: 0.2,
      specularLevel: 0.78,
      displacementScale: 0.02,
      normalStrength: 2.4,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 3,
    },
    generatePattern: (ctx, size) => generateTile(ctx, size, true),
  },

  // 16. Plásticos e Borrachas
  {
    id: 'borracha-moeda',
    name: 'Coin Grip Industrial Rubber',
    namePt: 'Borracha Moeda Antiderrapante',
    category: 'Plásticos e Borrachas',
    description: 'Piso emborrachado com relevos circulares salientes tipo moeda para segurança.',
    properties: {
      name: 'Borracha Moeda Antiderrapante',
      category: 'Plásticos e Borrachas',
      description: 'Revestimento resiliente de borracha sintética para áreas técnicas e academias.',
      ior: 1.52,
      metallic: 0.0,
      baseRoughness: 0.52,
      specularLevel: 0.4,
      displacementScale: 0.035,
      normalStrength: 3.5,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.18,
      seamlessTiling: 3,
    },
    generatePattern: (ctx, size) => generateRubberPlastic(ctx, size, 'coin'),
  },
  {
    id: 'polimero-abs',
    name: 'Matte Technical ABS Polymer',
    namePt: 'Polímero ABS Fosco Técnico',
    category: 'Plásticos e Borrachas',
    description: 'Plástico de engenharia termoplástico injetado com acabamento superficial VDI 24.',
    properties: {
      name: 'Polímero ABS Fosco Técnico',
      category: 'Plásticos e Borrachas',
      description: 'Carcaças de produtos eletrônicos e peças de design industrial em polímero fosco.',
      ior: 1.49,
      metallic: 0.0,
      baseRoughness: 0.44,
      specularLevel: 0.48,
      displacementScale: 0.005,
      normalStrength: 1.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateRubberPlastic(ctx, size, 'abs'),
  },

  // 17. Tecidos
  {
    id: 'woven-linen',
    name: 'Rustic Woven Linen Fabric',
    namePt: 'Tecido Linho Cru Trançado',
    category: 'Tecidos',
    description: 'Tecido têxtil natural de linho entrelaçado com fios de espessura variável.',
    properties: {
      name: 'Tecido Linho Cru Trançado',
      category: 'Tecidos',
      description: 'Trama têxtil orgânica com fibras entrelaçadas em padrão cruzado.',
      ior: 1.45,
      metallic: 0.0,
      baseRoughness: 0.9,
      specularLevel: 0.25,
      displacementScale: 0.025,
      normalStrength: 3.5,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.15,
      seamlessTiling: 4,
    },
    generatePattern: (ctx, size) => generateFabricLeather(ctx, size, 'linen'),
  },
  {
    id: 'vintage-leather',
    name: 'Distressed Vintage Leather',
    namePt: 'Couro Envelhecido Vintage',
    category: 'Tecidos',
    description: 'Couro bovino encerado com poros naturais, rugas de flexão e acabamento rico.',
    properties: {
      name: 'Couro Envelhecido Vintage',
      category: 'Tecidos',
      description: 'Superfície de couro marrom tabaco com padrão de células dérmicas.',
      ior: 1.49,
      metallic: 0.0,
      baseRoughness: 0.42,
      specularLevel: 0.55,
      displacementScale: 0.018,
      normalStrength: 2.6,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateFabricLeather(ctx, size, 'leather'),
  },

  // 18. Vegetação
  {
    id: 'grama-natural',
    name: 'Dense Lush Lawn Grass',
    namePt: 'Grama Natural Densa',
    category: 'Vegetação',
    description: 'Gramado natural verde esmeralda com folhas finas e solo fértil subjacente.',
    properties: {
      name: 'Grama Natural Densa',
      category: 'Vegetação',
      description: 'Gramado paisagístico com microrrelevo denso e dispersão de luz vegetal.',
      ior: 1.42,
      metallic: 0.0,
      baseRoughness: 0.88,
      specularLevel: 0.24,
      displacementScale: 0.05,
      normalStrength: 3.6,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.2,
      seamlessTiling: 3,
    },
    generatePattern: (ctx, size) => generateVegetation(ctx, size, 'grass'),
  },
  {
    id: 'musgo-florestal',
    name: 'Forest Moss and Soil',
    namePt: 'Musgo Florestal Úmido',
    category: 'Vegetação',
    description: 'Cobertura biológica de musgo aveludado verde escuro sobre rochas e troncos.',
    properties: {
      name: 'Musgo Florestal Úmido',
      category: 'Vegetação',
      description: 'Textura vegetal esponjosa com alta absorção lumínica e microrrelevo macio.',
      ior: 1.41,
      metallic: 0.0,
      baseRoughness: 0.92,
      specularLevel: 0.2,
      displacementScale: 0.045,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      seamlessBlendWidth: 0.22,
      seamlessTiling: 2,
    },
    generatePattern: (ctx, size) => generateVegetation(ctx, size, 'moss'),
  },
];

/**
 * Creates a preset texture canvas at the requested resolution
 */
export function createPresetCanvas(preset: MaterialPreset, resolution = 1024): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  preset.generatePattern(ctx, resolution);
  return canvas;
}
