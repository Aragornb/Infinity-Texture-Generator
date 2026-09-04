export type TextureResolution = 1024 | 2048 | 4096;

export type PBRMapType = 'diffuse' | 'specular' | 'normal' | 'roughness' | 'displacement' | 'ao';

export interface PBRMapData {
  diffuse: string;       // base64 data URL (JPG)
  specular: string;      // base64 data URL (JPG)
  normal: string;        // base64 data URL (JPG)
  roughness: string;     // base64 data URL (JPG)
  displacement: string;  // base64 data URL (JPG)
  ao: string;            // base64 data URL (JPG)
}

export type MaterialCategory =
  | 'Asfalto'
  | 'Concreto'
  | 'Gesso'
  | 'Granitos'
  | 'Líquidos'
  | 'Madeira'
  | 'Mármores'
  | 'MDF'
  | 'MDP'
  | 'Metal'
  | 'Papel de Parede'
  | 'Pavimentação'
  | 'Pedras'
  | 'Pinturas e Texturas'
  | 'Pisos e Revestimentos'
  | 'Plásticos e Borrachas'
  | 'Tecidos'
  | 'Vegetação';

export interface MaterialProperties {
  name: string;
  category: MaterialCategory | string;
  description: string;
  ior: number;
  metallic: number;
  baseRoughness: number;
  specularLevel: number;
  displacementScale: number;
  normalStrength: number;
  normalFormat: 'OpenGL' | 'DirectX';
  seamlessBlendWidth: number; // 0.0 to 0.5 (edge blend zone)
  seamlessTiling: number;      // 1, 2, 3, 4
  transparency?: number;       // 0.0 (opaque) to 1.0 (fully transparent / transmission)
  emissiveIntensity?: number;  // 0.0 (no glow) to 5.0 (bright emission)
  emissiveColor?: string;      // hex color string, default '#ffffff'
}

export interface SoftwareConfig {
  blender: {
    instructions: string[];
    pythonScript: string;
    principledBsdf: {
      baseColorSpace: string;
      normalColorSpace: string;
      roughnessColorSpace: string;
      displacementColorSpace: string;
      metallic: number;
      roughness: number;
      ior: number;
      displacementScale: number;
      transmission?: number;
      emissiveIntensity?: number;
    };
  };
  unreal: {
    instructions: string[];
    samplerSettings: Record<string, string>;
    compressionSettings: Record<string, string>;
    parameters: Record<string, number | string>;
  };
  unity: {
    instructions: string[];
    pipeline: 'URP' | 'HDRP';
    workflow: 'Metallic/Smoothness' | 'Specular';
    textureImportSettings: Record<string, string>;
    materialParams: Record<string, number | string>;
  };
  vray: {
    instructions: string[];
    vrayMtlSettings: Record<string, number | string>;
    displacementModifier: Record<string, number | string>;
  };
}

export interface PBRGenerationResult {
  material: MaterialProperties;
  maps: PBRMapData;
  resolution: TextureResolution;
  softwareConfig: SoftwareConfig;
}
