import { MaterialProperties } from '../types';

export interface MaterialTypeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  settings: Partial<MaterialProperties>;
}

export interface MaterialTypeCategoryGroup {
  category: string;
  items: MaterialTypeDefinition[];
}

export const MATERIAL_TYPE_CATEGORIES: MaterialTypeCategoryGroup[] = [
  {
    category: 'Neutro & Geral',
    items: [
      {
        id: 'generic',
        name: 'Padrão Neutro / Estúdio',
        category: 'Neutro & Geral',
        description: 'Superfície equilibrada de estúdio ideal para qualquer teste de textura.',
        settings: {
          baseRoughness: 0.50,
          specularLevel: 0.50,
          metallic: 0.0,
          normalStrength: 1.0,
          displacementScale: 0.00,
          ior: 1.50,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Pedras & Mármores',
    items: [
      {
        id: 'polished_marble',
        name: 'Mármore / Granito Polido',
        category: 'Pedras & Mármores',
        description: 'Alta refletividade especular, superfície ultra-lisa e relevo sutil.',
        settings: {
          baseRoughness: 0.10,
          specularLevel: 0.92,
          metallic: 0.0,
          normalStrength: 1.2,
          displacementScale: 0.015,
          ior: 1.52,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'rough_stone',
        name: 'Pedra Rústica / Granito Bruto',
        category: 'Pedras & Mármores',
        description: 'Forte relevo, normal pronunciada, alta rugosidade e baixa reflexão.',
        settings: {
          baseRoughness: 0.90,
          specularLevel: 0.20,
          metallic: 0.0,
          normalStrength: 3.2,
          displacementScale: 0.08,
          ior: 1.54,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'slate_stone',
        name: 'Ardósia / Pedra Natural',
        category: 'Pedras & Mármores',
        description: 'Fendas estratificadas com reflexão suave e relevo moderado.',
        settings: {
          baseRoughness: 0.68,
          specularLevel: 0.35,
          metallic: 0.0,
          normalStrength: 2.6,
          displacementScale: 0.05,
          ior: 1.53,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'terrazzo',
        name: 'Granilite / Terrazzo Envernizado',
        category: 'Pedras & Mármores',
        description: 'Reflexos vivos de verniz com leve relevo nos agregados minerais.',
        settings: {
          baseRoughness: 0.18,
          specularLevel: 0.82,
          metallic: 0.0,
          normalStrength: 1.1,
          displacementScale: 0.012,
          ior: 1.51,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Madeiras',
    items: [
      {
        id: 'varnished_wood',
        name: 'Madeira Envernizada / Parquet',
        category: 'Madeiras',
        description: 'Brilho espelhado de selante PU ou verniz com veios definidos.',
        settings: {
          baseRoughness: 0.22,
          specularLevel: 0.78,
          metallic: 0.0,
          normalStrength: 1.8,
          displacementScale: 0.03,
          ior: 1.50,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'rustic_wood',
        name: 'Madeira Rústica / Demolição',
        category: 'Madeiras',
        description: 'Fibras secas, rachaduras profundas e relevo marcante.',
        settings: {
          baseRoughness: 0.82,
          specularLevel: 0.24,
          metallic: 0.0,
          normalStrength: 2.8,
          displacementScale: 0.07,
          ior: 1.48,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'mdf_laminate',
        name: 'MDF / Melamina Fosca',
        category: 'Madeiras',
        description: 'Superfície de marcenaria contemporânea com acabamento acetinado.',
        settings: {
          baseRoughness: 0.45,
          specularLevel: 0.48,
          metallic: 0.0,
          normalStrength: 1.0,
          displacementScale: 0.01,
          ior: 1.49,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Metais',
    items: [
      {
        id: 'polished_chrome',
        name: 'Metal Polido / Cromo Espelhado',
        category: 'Metais',
        description: 'Refletividade máxima de 100%, rugosidade quase nula e metalicidade total.',
        settings: {
          baseRoughness: 0.05,
          specularLevel: 1.0,
          metallic: 1.0,
          normalStrength: 0.6,
          displacementScale: 0.005,
          ior: 2.50,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'brushed_steel',
        name: 'Aço Escovado / Alumínio',
        category: 'Metais',
        description: 'Micro-ranhuras lineares com reflexos anisotrópicos e brilho metálico.',
        settings: {
          baseRoughness: 0.35,
          specularLevel: 0.85,
          metallic: 0.95,
          normalStrength: 1.8,
          displacementScale: 0.015,
          ior: 2.10,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'gold_brass',
        name: 'Ouro / Latão Polido',
        category: 'Metais',
        description: 'Metal nobre com alta intensidade de reflexo e superfície lisa.',
        settings: {
          baseRoughness: 0.14,
          specularLevel: 0.95,
          metallic: 1.0,
          normalStrength: 0.8,
          displacementScale: 0.01,
          ior: 1.80,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'cast_iron',
        name: 'Ferro Fundido / Oxidado',
        category: 'Metais',
        description: 'Metal rugoso com granulação porosa e micro-relevo de oxidação.',
        settings: {
          baseRoughness: 0.85,
          specularLevel: 0.40,
          metallic: 0.80,
          normalStrength: 3.0,
          displacementScale: 0.06,
          ior: 1.95,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Vidros & Líquidos',
    items: [
      {
        id: 'clear_glass',
        name: 'Vidro / Cristal Transparente',
        category: 'Vidros & Líquidos',
        description: 'Alta transmissão óptica (88%), IOR 1.52 e reflexão nítida.',
        settings: {
          baseRoughness: 0.03,
          specularLevel: 1.0,
          metallic: 0.0,
          normalStrength: 0.5,
          displacementScale: 0.005,
          ior: 1.52,
          transparency: 0.88,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'frosted_glass',
        name: 'Vidro Jateado / Fosco',
        category: 'Vidros & Líquidos',
        description: 'Vidro com micro-rugosidade que difunde a luz e refrações internas.',
        settings: {
          baseRoughness: 0.55,
          specularLevel: 0.60,
          metallic: 0.0,
          normalStrength: 1.2,
          displacementScale: 0.015,
          ior: 1.48,
          transparency: 0.65,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'tinted_glass',
        name: 'Vidro Fumê / Colorido',
        category: 'Vidros & Líquidos',
        description: 'Painel envidraçado translúcido para janelas e divisórias arquitetônicas.',
        settings: {
          baseRoughness: 0.06,
          specularLevel: 0.92,
          metallic: 0.0,
          normalStrength: 0.6,
          displacementScale: 0.005,
          ior: 1.52,
          transparency: 0.75,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'water_liquid',
        name: 'Água / Líquido Cristalino',
        category: 'Vidros & Líquidos',
        description: 'Índice de refração físico 1.333, reflexão cristalina e transparência.',
        settings: {
          baseRoughness: 0.02,
          specularLevel: 1.0,
          metallic: 0.0,
          normalStrength: 2.0,
          displacementScale: 0.04,
          ior: 1.333,
          transparency: 0.92,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Cerâmicas & Alvenaria',
    items: [
      {
        id: 'polished_ceramic',
        name: 'Cerâmica / Porcelanato Brilhante',
        category: 'Cerâmicas & Alvenaria',
        description: 'Esmalte brilhante, alta reflexão especular e juntas milimétricas.',
        settings: {
          baseRoughness: 0.08,
          specularLevel: 0.92,
          metallic: 0.0,
          normalStrength: 1.0,
          displacementScale: 0.012,
          ior: 1.55,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'terracotta_brick',
        name: 'Tijolo Aparente / Terracota',
        category: 'Cerâmicas & Alvenaria',
        description: 'Alvenaria com forte relevo entre juntas e textura argilosa fosca.',
        settings: {
          baseRoughness: 0.88,
          specularLevel: 0.18,
          metallic: 0.0,
          normalStrength: 2.9,
          displacementScale: 0.08,
          ior: 1.53,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'exposed_concrete',
        name: 'Concreto Aparente / Cimento Queimado',
        category: 'Cerâmicas & Alvenaria',
        description: 'Acabamento mineral poroso com micro-bolhas de ar e reflexo mate.',
        settings: {
          baseRoughness: 0.82,
          specularLevel: 0.25,
          metallic: 0.0,
          normalStrength: 2.4,
          displacementScale: 0.05,
          ior: 1.50,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'stucco_plaster',
        name: 'Gesso / Reboco / Stucco',
        category: 'Cerâmicas & Alvenaria',
        description: 'Textura mineral contínua com espalhamento de luz suave.',
        settings: {
          baseRoughness: 0.86,
          specularLevel: 0.20,
          metallic: 0.0,
          normalStrength: 2.2,
          displacementScale: 0.035,
          ior: 1.48,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Tecidos & Couros',
    items: [
      {
        id: 'cotton_fabric',
        name: 'Tecido / Algodão & Linho',
        category: 'Tecidos & Couros',
        description: 'Trama têxtil visível, alta dispersão difusa e reflexão suave.',
        settings: {
          baseRoughness: 0.88,
          specularLevel: 0.18,
          metallic: 0.0,
          normalStrength: 2.4,
          displacementScale: 0.03,
          ior: 1.42,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'silk_satin',
        name: 'Tecido / Seda & Cetim',
        category: 'Tecidos & Couros',
        description: 'Trama lustrosa com reflexão direcional vívida e caimento suave.',
        settings: {
          baseRoughness: 0.26,
          specularLevel: 0.82,
          metallic: 0.10,
          normalStrength: 1.4,
          displacementScale: 0.02,
          ior: 1.46,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'velvet',
        name: 'Tecido / Veludo Nobre',
        category: 'Tecidos & Couros',
        description: 'Pelugem densa com efeito sheen aveludado e brilho nos ângulos rasantes.',
        settings: {
          baseRoughness: 0.72,
          specularLevel: 0.45,
          metallic: 0.05,
          normalStrength: 2.0,
          displacementScale: 0.03,
          ior: 1.44,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'leather',
        name: 'Couro Natural / Sintético',
        category: 'Tecidos & Couros',
        description: 'Poros orgânicos e estrias naturais com brilho acetinado.',
        settings: {
          baseRoughness: 0.42,
          specularLevel: 0.58,
          metallic: 0.0,
          normalStrength: 2.5,
          displacementScale: 0.04,
          ior: 1.46,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
    ],
  },
  {
    category: 'Plásticos & Especiais',
    items: [
      {
        id: 'glossy_plastic',
        name: 'Plástico Brilhante / Acrílico',
        category: 'Plásticos & Especiais',
        description: 'Superfície polimérica com reflexos brilhantes nítidos.',
        settings: {
          baseRoughness: 0.12,
          specularLevel: 0.85,
          metallic: 0.0,
          normalStrength: 0.8,
          displacementScale: 0.01,
          ior: 1.46,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'matte_rubber',
        name: 'Borracha / Silicone Fosco',
        category: 'Plásticos & Especiais',
        description: 'Absorção de luz alta, sem brilho especular e toque macio.',
        settings: {
          baseRoughness: 0.92,
          specularLevel: 0.14,
          metallic: 0.0,
          normalStrength: 1.5,
          displacementScale: 0.02,
          ior: 1.42,
          transparency: 0.0,
          emissiveIntensity: 0.0,
        },
      },
      {
        id: 'emissive_neon',
        name: 'Néon / Superfície Emissiva',
        category: 'Plásticos & Especiais',
        description: 'Painel retroiluminado ou tubo de néon com emissão de luz intensa.',
        settings: {
          baseRoughness: 0.20,
          specularLevel: 0.70,
          metallic: 0.0,
          normalStrength: 0.6,
          displacementScale: 0.01,
          ior: 1.50,
          transparency: 0.0,
          emissiveIntensity: 3.0,
        },
      },
    ],
  },
];

export function findMaterialPresetById(id: string): MaterialTypeDefinition | undefined {
  for (const group of MATERIAL_TYPE_CATEGORIES) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

const PRESET_LOCALIZATIONS: Record<
  string,
  Record<'en' | 'es' | 'zh' | 'ja', { name: string; desc: string }>
> = {
  generic: {
    en: { name: 'Neutral / Studio Standard', desc: 'Balanced neutral studio surface ideal for any texture inspection.' },
    es: { name: 'Estándar Neutro / Estudio', desc: 'Superficie equilibrada de estudio ideal para cualquier prueba de textura.' },
    zh: { name: '中性演播室 / 标准基准', desc: '平衡的中性摄影棚表面，适合各种纹理测试。' },
    ja: { name: '中立スタジオ / 標準基準', desc: 'あらゆるテクスチャ検証に最適なバランスの取れたスタジオサーフェス。' },
  },
  polished_marble: {
    en: { name: 'Polished Marble / Granite', desc: 'High specular reflectivity, ultra-smooth surface and subtle vein relief.' },
    es: { name: 'Mármol / Granito Pulido', desc: 'Alta reflectividad especular, superficie ultra suave y relieve de vetas sutil.' },
    zh: { name: '抛光大理石 / 花岗岩', desc: '高镜面反射率、超平滑表面和细腻纹理凹凸。' },
    ja: { name: '研磨大理石 / 花崗岩', desc: '高い鏡面反射率、滑らかな表面と繊細な脈状レリーフ。' },
  },
  rough_stone: {
    en: { name: 'Rustic Stone / Rough Granite', desc: 'Deep relief, strong normal perturbation, high roughness, and low reflection.' },
    es: { name: 'Piedra Rústica / Granito Bruto', desc: 'Fuerte relieve, normal pronunciada, alta rugosidad y baja reflexión.' },
    zh: { name: '粗面石材 / 毛石花岗岩', desc: '深度凹凸位移，强法线扰动，高粗糙度与低反射。' },
    ja: { name: '割肌石材 / 粗面花崗岩', desc: '強い凹凸、明確な法線、高い粗さと控えめな反射。' },
  },
  slate_stone: {
    en: { name: 'Slate / Natural Rock', desc: 'Stratified fissures with gentle reflection and medium displacement.' },
    es: { name: 'Pizarra / Piedra Natural', desc: 'Fisuras estratificadas con reflexión suave y relieve moderado.' },
    zh: { name: '板岩 / 天然岩石', desc: '层状解理裂隙，柔和反射与中等置换。' },
    ja: { name: 'スレート / 天然石', desc: '層状の割れ目、穏やかな反射と適度な変位。' },
  },
  terrazzo: {
    en: { name: 'Terrazzo / Polished Aggregate', desc: 'Glossy clearcoat sheen with slight relief over mineral chips.' },
    es: { name: 'Terrazo / Granito Pulido', desc: 'Reflejos vivos de barniz con leve relieve en los agregados minerales.' },
    zh: { name: '水磨石 / 抛光骨料', desc: '清漆涂层亮丽反射，矿物碎屑略带触觉微凹凸。' },
    ja: { name: 'テラゾー / 研磨骨材', desc: 'ワニスの鮮やかな光沢と骨材の微細なレリーフ。' },
  },
  varnished_wood: {
    en: { name: 'Varnished Wood / Parquet', desc: 'Glossy polyurethane reflection with pronounced organic wood grains.' },
    es: { name: 'Madera Barnizada / Parquet', desc: 'Brillo espejado de barniz PU con vetas definidas de madera.' },
    zh: { name: '清漆木地板 / 拼花地板', desc: 'PU 清漆的高光反射，清晰有机的天然木纹。' },
    ja: { name: 'ニス塗装木材 / フローリング', desc: 'ウレタンニスの高光沢とくっきりとした木目。' },
  },
  rustic_wood: {
    en: { name: 'Rustic Wood / Reclaimed Plank', desc: 'Fibrous relief, matte surface with open pores and micro-cracks.' },
    es: { name: 'Madera Rústica / Tablón Viejo', desc: 'Relieve fibroso, superficie mate con poros abiertos y microgrietas.' },
    zh: { name: '做旧实木 / 糙木板', desc: '纤维肌理凹凸，开孔磨砂表面与岁月微裂纹。' },
    ja: { name: '古材 / ラフウッド', desc: '繊維状の凹凸、オープンポアと微細な割れのあるマットな質感。' },
  },
  matte_mdf: {
    en: { name: 'Matte MDF / Melamine Board', desc: 'Satin architectural panel with smooth micro-grain and low gloss.' },
    es: { name: 'MDF Mate / Tablero de Melamina', desc: 'Panel satinado arquitectónico con micrograno suave y bajo brillo.' },
    zh: { name: '哑光密度板 / 三聚氰胺板', desc: '建筑装饰缎面饰面板，平滑微晶与柔和低反光。' },
    ja: { name: 'マットMDF / メラミン化粧板', desc: '滑らかな微粒子と落ち着いた艶消し建築パネル。' },
  },
  mirror_chrome: {
    en: { name: 'Mirror Chrome / Silver Metal', desc: 'Pure 100% metallic mirror reflection with near-zero roughness.' },
    es: { name: 'Cromo Espejo / Metal Plateado', desc: 'Reflejo metálico especular puro con rugosidad cercana a cero.' },
    zh: { name: '镜面镀铬 / 银色金属', desc: '纯镜面金属反射，粗糙度趋近于零。' },
    ja: { name: 'ミラークロム / 銀色金属', desc: '粗さほぼゼロの完全な鏡面メタル反射。' },
  },
  brushed_steel: {
    en: { name: 'Brushed Steel / Anodized Aluminum', desc: 'Directional anisotropic micro-grooves with semi-specular metal finish.' },
    es: { name: 'Acero Cepillado / Aluminio Anodizado', desc: 'Microestrías direccionales con acabado metálico semiespecular.' },
    zh: { name: '拉丝不锈钢 / 阳极氧化铝', desc: '各向异性微拉丝沟槽，半镜面金属光泽。' },
    ja: { name: 'ヘアライン鋼 / アルマイトアルミ', desc: '異方性ヘアライン筋と半鏡面メタルフィニッシュ。' },
  },
  polished_gold: {
    en: { name: 'Polished Gold / Yellow Brass', desc: 'Rich golden metallic tinted specular reflectance with mirror polish.' },
    es: { name: 'Oro Pulido / Latón Amarillo', desc: 'Reflectancia metálica teñida en oro vivo con pulido espejo.' },
    zh: { name: '高光黄金 / 黄铜抛光', desc: '镜面级纯金黄光泽反射与金属本色色度。' },
    ja: { name: '金磨き / 真鍮ゴールド', desc: '深みのある黄金色メタル反射と鏡面ポリッシュ。' },
  },
  cast_iron: {
    en: { name: 'Cast Iron / Oxidized Steel', desc: 'Coarse porous granular metal texture with micro-pitting.' },
    es: { name: 'Hierro Fundido / Acero Oxidado', desc: 'Textura metálica granular porosa con microalveolos.' },
    zh: { name: '铸铁 / 氧化生铁', desc: '粗糙多孔颗粒金属质感，带有微细麻坑。' },
    ja: { name: '鋳鉄 / 酸化スチール', desc: '多孔質の粗い粒子感と微細なピットを持つ金属質感。' },
  },
  clear_glass: {
    en: { name: 'Clear Glass / Pure Crystal', desc: 'Complete physical transmission, IOR 1.52 with sharp specular highlight.' },
    es: { name: 'Vidrio Transparente / Cristal Puro', desc: 'Transmisión física completa, IOR 1.52 con brillo especular nítido.' },
    zh: { name: '透明玻璃 / 纯净水晶', desc: '完全物理透射，折射率 1.52，锐利高光。' },
    ja: { name: '透明ガラス / クリスタル', desc: '完全な透過、屈折率1.52とシャープなスペキュラ。' },
  },
  frosted_glass: {
    en: { name: 'Frosted Glass / Sandblasted', desc: 'Subsurface light diffusion with rough frosted micro-surface.' },
    es: { name: 'Vidrio Esmerilado / Arenado', desc: 'Difusión de luz subsuperficial con microrrugosidad satinada.' },
    zh: { name: '磨砂玻璃 / 喷砂玻璃', desc: '半透光漫射与磨砂微观凹凸表面。' },
    ja: { name: 'フロストガラス / すりガラス', desc: '柔らかな光の拡散と細かなサンドブラスト肌。' },
  },
  tinted_glass: {
    en: { name: 'Smoked / Tinted Glass', desc: 'Architectural tinted safety glass with high surface gloss.' },
    es: { name: 'Vidrio Ahumado / Tintado', desc: 'Vidrio arquitectónico tintado con alto brillo superficial.' },
    zh: { name: '烟熏暗色玻璃 / 建筑镀膜玻璃', desc: '建筑色调减光玻璃，外表维持高亮镜面反射。' },
    ja: { name: 'スモークガラス / 着色ガラス', desc: '高い表面光沢を備えた建築用スモークガラス。' },
  },
  water_liquid: {
    en: { name: 'Clear Water / Liquid Surface', desc: 'Transmission 98%, low dielectric IOR 1.33 with undulating normal.' },
    es: { name: 'Agua Cristalina / Superficie Líquida', desc: 'Transmisión 98%, IOR dieléctrico bajo 1.33 con normal ondulada.' },
    zh: { name: '清澈水面 / 液体流体', desc: '透光率 98%，水介质折射率 1.33 与波浪法线。' },
    ja: { name: '澄んだ水 / 液体表面', desc: '透過率98%、水特有の屈折率1.33と波打つ法線。' },
  },
  glossy_porcelain: {
    en: { name: 'Glossy Porcelain / Ceramic Tile', desc: 'Silky smooth vitreous glaze with mirror reflection.' },
    es: { name: 'Porcelana Brillante / Azulejo Cerámico', desc: 'Esmalte vítreo suave y sedoso con reflejo espejado.' },
    zh: { name: '高光瓷砖 / 釉面陶瓷', desc: '丝滑玻璃质釉面与清晰高光镜面反射。' },
    ja: { name: '光沢磁器 / セラミックタイル', desc: '鏡面反射を持つシルキーで滑らかなガラス質釉薬。' },
  },
  exposed_brick: {
    en: { name: 'Exposed Clay Brick', desc: 'Pronounced relief, deep mortar joints, high roughness and porosity.' },
    es: { name: 'Ladrillo Visto de Arcilla', desc: 'Relieve pronunciado, juntas de mortero profundas y alta rugosidad.' },
    zh: { name: '清水粘土砖墙', desc: '高深凸凹浮雕、深嵌砂浆灰缝、粗糙多孔。' },
    ja: { name: '赤レンガ目地仕上げ', desc: '深いモルタル目地、明瞭な凹凸と多孔質の粗面。' },
  },
  concrete_wall: {
    en: { name: 'Cast Concrete / Burnished Cement', desc: 'Fine aggregate roughness with subtle formwork seams.' },
    es: { name: 'Hormigón Visto / Cemento Pulido', desc: 'Rugosidad de árido fino con sutiles juntas de encofrado.' },
    zh: { name: '清水混凝土 / 批荡水泥', desc: '细腻骨料粗糙度，微弱模板拼缝痕迹。' },
    ja: { name: '打ち放しコンクリート / モルタル', desc: '細骨材の心地よい粗さと控えめな型枠跡。' },
  },
  plaster_wall: {
    en: { name: 'Painted Plaster / Stucco', desc: 'Completely matte latex finish with soft micro-texture.' },
    es: { name: 'Yeso Pintado / Estuco', desc: 'Acabado de látex totalmente mate con microtextura suave.' },
    zh: { name: '粉刷石膏 / 质感涂料', desc: '完全哑光乳胶漆质感，细腻均匀微纹。' },
    ja: { name: '塗装プラスター / 漆喰壁', desc: '柔らかな微細テクスチャを持つ完全な艶消し仕上げ。' },
  },
  cotton_linen: {
    en: { name: 'Cotton & Linen / Natural Weave', desc: 'Textile micro-relief, completely matte with zero metallic.' },
    es: { name: 'Algodón y Lino / Tejido Natural', desc: 'Microrelieve textil, totalmente mate sin metalicidad.' },
    zh: { name: '棉麻织物 / 天然纤维', desc: '织物微观经纬凹凸，完全亚光无金属感。' },
    ja: { name: 'コットン＆リネン / 織布', desc: '布地特有の微細な編み目と金属感ゼロのマット質感。' },
  },
  silk_satin: {
    en: { name: 'Silk & Satin Weave', desc: 'Glossy directional sheen with silky smooth highlights.' },
    es: { name: 'Seda y Satén', desc: 'Brillo direccional sedoso con reflejos suaves y fluidos.' },
    zh: { name: '丝绸与缎面', desc: '丝滑流动高光与定向经纬柔顺微反光。' },
    ja: { name: 'シルク＆サテン', desc: '流れるような美しい光沢と滑らかなシルキースペキュラ。' },
  },
  velvet_cloth: {
    en: { name: 'Royal Velvet / Velour', desc: 'Furry micro-pile scattering light along grazing viewing angles.' },
    es: { name: 'Terciopelo Noble', desc: 'Pelusa de microfibras que dispersa la luz en ángulos rasantes.' },
    zh: { name: '高级天鹅绒 / 丝绒', desc: '微绒毛结构在掠射视角下呈现独特的柔和边缘光散射。' },
    ja: { name: 'ベルベット / ベロア', desc: '斜めからの光を柔らかく散乱させる極細の毛足。' },
  },
  natural_leather: {
    en: { name: 'Natural / Synthetic Leather', desc: 'Organic pores and creases with supple semi-matte sheen.' },
    es: { name: 'Cuero Natural / Sintético', desc: 'Poros y pliegues orgánicos con brillo flexible semimate.' },
    zh: { name: '天然皮革 / 仿皮', desc: '有机毛孔褶皱与温润柔韧的半哑光光泽。' },
    ja: { name: '天然本革 / 合成皮革', desc: '有機的な毛穴やシワとしなやかな半光沢。' },
  },
  glossy_plastic: {
    en: { name: 'Glossy Plastic / Acrylic', desc: 'Dielectric specular peak, ultra-smooth mold finish.' },
    es: { name: 'Plástico Brillante / Acrílico', desc: 'Pico especular dieléctrico con acabado de molde ultra liso.' },
    zh: { name: '亮面塑料 / 亚克力', desc: '高亮介电质高光，超平滑注塑成型光洁度。' },
    ja: { name: '光沢プラスチック / アクリル', desc: '誘電体スペキュラピークと超平滑成形仕上げ。' },
  },
  matte_rubber: {
    en: { name: 'Matte Rubber / Silicone', desc: 'High light absorption, zero sheen and soft-touch feel.' },
    es: { name: 'Goma / Silicona Mate', desc: 'Alta absorción de luz, sin brillo y tacto suave.' },
    zh: { name: '哑光橡胶 / 硅胶', desc: '高吸光率，无光泽，类肤质软触感。' },
    ja: { name: 'マットラバー / シリコン', desc: '高い光吸収、無光沢で柔らかな手触りの質感。' },
  },
  emissive_neon: {
    en: { name: 'Neon / Emissive Panel', desc: 'Backlit display or gas neon tube with bright photon emission.' },
    es: { name: 'Neón / Superficie Emisora', desc: 'Panel retroiluminado o tubo de neón con emisión brillante de luz.' },
    zh: { name: '霓虹发光体 / 发光表面', desc: '背光面板或高亮发光体，具备强烈的光子辉光发射。' },
    ja: { name: 'ネオン / 発光面', desc: '高輝度な光子放出を伴うバックライトパネルやネオン管。' },
  },
};

const CATEGORY_NAMES: Record<string, Record<'en' | 'es' | 'zh' | 'ja', string>> = {
  'Neutro & Geral': { en: 'Neutral & Studio', es: 'Neutro y General', zh: '中性与演播室', ja: 'ニュートラル＆スタジオ' },
  'Pedras & Mármores': { en: 'Stones & Marbles', es: 'Piedras y Mármoles', zh: '石材与大理石', ja: '石材＆大理石' },
  'Madeiras': { en: 'Woods & Planks', es: 'Maderas', zh: '木材与实木板', ja: '木材＆フローリング' },
  'Metais': { en: 'Metals & Alloys', es: 'Metales y Aleaciones', zh: '金属与合金', ja: '金属＆合金' },
  'Vidros & Líquidos': { en: 'Glass & Liquids', es: 'Vidrios y Líquidos', zh: '玻璃与液体', ja: 'ガラス＆液体' },
  'Cerâmicas & Alvenaria': { en: 'Ceramics & Masonry', es: 'Cerámicas y Albañilería', zh: '陶瓷与砌体', ja: 'セラミック＆石工' },
  'Tecidos & Couros': { en: 'Fabrics & Leathers', es: 'Telas y Cueros', zh: '面料与皮革', ja: 'ファブリック＆レザー' },
  'Plásticos & Especiais': { en: 'Plastics & Specials', es: 'Plásticos y Especiales', zh: '塑料与特殊材质', ja: 'プラスチック＆特殊' },
};

export function getLocalizedMaterialCategories(lang: string): MaterialTypeCategoryGroup[] {
  if (lang === 'pt') return MATERIAL_TYPE_CATEGORIES;
  const l = (['en', 'es', 'zh', 'ja'].includes(lang) ? lang : 'en') as 'en' | 'es' | 'zh' | 'ja';

  return MATERIAL_TYPE_CATEGORIES.map((group) => {
    const localizedCategory = CATEGORY_NAMES[group.category]?.[l] || group.category;
    return {
      category: localizedCategory,
      items: group.items.map((item) => {
        const loc = PRESET_LOCALIZATIONS[item.id]?.[l];
        return {
          ...item,
          name: loc?.name || item.name,
          category: localizedCategory,
          description: loc?.desc || item.description,
        };
      }),
    };
  });
}

