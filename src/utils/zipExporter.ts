import JSZip from 'jszip';
import { MaterialProperties, PBRMapData, SoftwareConfig, TextureResolution } from '../types';
import { generateSoftwareConfig, generateUnifiedTextDoc } from './softwareGuides';

/**
 * Converts a base64 Data URL to a pure binary Uint8Array
 */
function dataUrlToBinary(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    throw new Error('Invalid data URL');
  }
  const base64 = dataUrl.substring(base64Index + 8);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Packs all PBR textures, configuration files, Blender Python script,
 * and unified text guide into a single downloadable .zip archive.
 */
export async function exportPBRBundleZip(
  material: MaterialProperties,
  maps: PBRMapData,
  resolution: TextureResolution,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  const safeName = material.name.toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  const folderName = `${safeName}_pbr_${resolution}k`;
  const folder = zip.folder(folderName) || zip;

  onProgress?.(10, 'Preparando texturas PBR...');

  // Add all 5 required JPG maps + AO
  folder.file(`${safeName}_diffuse.jpg`, dataUrlToBinary(maps.diffuse));
  onProgress?.(25, 'Adicionando mapa de difusão...');

  folder.file(`${safeName}_specular.jpg`, dataUrlToBinary(maps.specular));
  onProgress?.(40, 'Adicionando mapa especular...');

  folder.file(`${safeName}_normal.jpg`, dataUrlToBinary(maps.normal));
  onProgress?.(55, 'Adicionando mapa de normais...');

  folder.file(`${safeName}_roughness.jpg`, dataUrlToBinary(maps.roughness));
  onProgress?.(70, 'Adicionando mapa de rugosidade...');

  folder.file(`${safeName}_displacement.jpg`, dataUrlToBinary(maps.displacement));
  onProgress?.(80, 'Adicionando mapa de deslocamento...');

  folder.file(`${safeName}_ao.jpg`, dataUrlToBinary(maps.ao));

  // Generate Software configs & documentation
  const softwareConfig = generateSoftwareConfig(material, safeName);
  const unifiedGuideText = generateUnifiedTextDoc(material, safeName, softwareConfig, resolution);

  // 1. Unified multi-software text guide
  folder.file('MATERIAL_CONFIG_BLENDER_VRAY_UNITY_UNREAL.txt', unifiedGuideText);

  // 2. Python automation script for Blender
  folder.file('setup_pbr_blender.py', softwareConfig.blender.pythonScript);

  // 3. Technical JSON specification
  const technicalJson = JSON.stringify(
    {
      materialName: material.name,
      category: material.category,
      description: material.description,
      resolution: `${resolution}x${resolution}`,
      isSeamless: true,
      physicalProperties: {
        ior: material.ior,
        transparency: material.transparency ?? 0,
        emissiveIntensity: material.emissiveIntensity ?? 0,
        metallic: material.metallic,
        baseRoughness: material.baseRoughness,
        specularLevel: material.specularLevel,
        displacementScale: material.displacementScale,
        normalStrength: material.normalStrength,
        normalFormat: material.normalFormat,
      },
      fileManifest: [
        `${safeName}_diffuse.jpg`,
        `${safeName}_specular.jpg`,
        `${safeName}_normal.jpg`,
        `${safeName}_roughness.jpg`,
        `${safeName}_displacement.jpg`,
        `${safeName}_ao.jpg`,
      ],
      softwareConfig: softwareConfig,
    },
    null,
    2
  );
  folder.file('material_settings.json', technicalJson);

  // 4. Quick README
  const readmeContent = `SEAMLESS PBR TEXTURE PACK - 4K READY
========================================================================
Material: ${material.name}
Resolution: ${resolution}x${resolution}
Seamless / Tileable: Yes (Infinite X/Y tiling without visible seams)
Generated: ${new Date().toISOString()}

MAPS INCLUDED:
- ${safeName}_diffuse.jpg       (Albedo / Base Color)
- ${safeName}_specular.jpg      (Reflectance F0)
- ${safeName}_normal.jpg        (Tangent space normal, ${material.normalFormat})
- ${safeName}_roughness.jpg     (Micro-surface roughness)
- ${safeName}_displacement.jpg  (Height displacement for tessellation)
- ${safeName}_ao.jpg            (Ambient Occlusion)

QUICK START:
- Blender: Run "setup_pbr_blender.py" inside Blender's Scripting tab!
- Unreal Engine / Unity / V-Ray: Open "MATERIAL_CONFIG_BLENDER_VRAY_UNITY_UNREAL.txt"
  for exact step-by-step import parameters and connection diagrams.
========================================================================
`;
  folder.file('README.txt', readmeContent);

  onProgress?.(90, 'Compactando arquivo ZIP...');

  const contentBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(90 + Math.round(metadata.percent * 0.1), `Compactando (${Math.round(metadata.percent)}%)...`);
    }
  );

  onProgress?.(100, 'Download pronto!');
  return contentBlob;
}

/**
 * Triggers the browser to download a Blob as a file
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
