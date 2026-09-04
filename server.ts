import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Body parser for JSON with large payload support for image base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

const OFFICIAL_CATEGORIES = [
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
 * Intelligent deterministic fallback classifier for Portuguese architectural materials
 */
function classifyMaterialLocally(prompt: string) {
  const p = prompt.toLowerCase();

  if (p.includes('ripad') || p.includes('ripa')) {
    return {
      name: 'Madeira Ripada Arquitetônica',
      category: 'Madeira',
      description: 'Painel ripado de madeira com espaçamento regular e ranhuras sombreadas.',
      patternType: 'wood_slats',
      primaryColor: '#c89d6e',
      secondaryColor: '#a77a4b',
      veinOrJointColor: '#2b1d12',
      highlightColor: '#ecd3b0',
      ior: 1.51,
      metallic: 0.0,
      baseRoughness: 0.45,
      specularLevel: 0.5,
      displacementScale: 0.035,
      normalStrength: 2.8,
      normalFormat: 'OpenGL',
      aoIntensity: 1.5,
      matchedPresetId: 'oak-wood',
    };
  }

  if (p.includes('travertin') || p.includes('mármore') || p.includes('marmore') || p.includes('calacatta') || p.includes('carrara')) {
    const isDark = p.includes('preto') || p.includes('negro') || p.includes('marquina');
    return {
      name: isDark ? 'Mármore Negro com Veios' : 'Mármore Nobre Veiado',
      category: 'Mármores',
      description: 'Rocha metamórfica nobre polida com veios minerais fluidos.',
      patternType: 'marble',
      primaryColor: isDark ? '#1a1b1e' : '#f0ece1',
      secondaryColor: isDark ? '#2a2d33' : '#dcd6c8',
      veinOrJointColor: isDark ? '#e2d3b3' : '#6b5c4d',
      highlightColor: '#ffffff',
      ior: 1.54,
      metallic: 0.0,
      baseRoughness: 0.12,
      specularLevel: 0.88,
      displacementScale: 0.008,
      normalStrength: 1.4,
      normalFormat: 'OpenGL',
      aoIntensity: 0.9,
      matchedPresetId: isDark ? 'marmore-nero-marquina' : 'marmore-carrara',
    };
  }

  if (p.includes('tijol') || p.includes('brick') || p.includes('alvenaria')) {
    return {
      name: 'Tijolo Aparente com Argamassa',
      category: 'Pisos e Revestimentos',
      description: 'Alvenaria de tijolos cerâmicos aparentes com juntas de assentamento.',
      patternType: 'bricks',
      primaryColor: '#b5583b',
      secondaryColor: '#964228',
      veinOrJointColor: '#c2bcad',
      highlightColor: '#d67556',
      ior: 1.52,
      metallic: 0.0,
      baseRoughness: 0.85,
      specularLevel: 0.35,
      displacementScale: 0.045,
      normalStrength: 3.5,
      normalFormat: 'OpenGL',
      aoIntensity: 1.6,
      matchedPresetId: 'tijolo-rustico',
    };
  }

  if (p.includes('madeira') || p.includes('wood') || p.includes('carvalho') || p.includes('freijó') || p.includes('freijo') || p.includes('nogueira') || p.includes('tábua')) {
    return {
      name: 'Madeira Natural com Fibras',
      category: 'Madeira',
      description: 'Superfície de madeira nobre com anéis de crescimento e veios longitudinais.',
      patternType: 'wood_planks',
      primaryColor: '#b88a57',
      secondaryColor: '#8a5c2d',
      veinOrJointColor: '#361e0b',
      highlightColor: '#deb887',
      ior: 1.51,
      metallic: 0.0,
      baseRoughness: 0.42,
      specularLevel: 0.52,
      displacementScale: 0.02,
      normalStrength: 2.2,
      normalFormat: 'OpenGL',
      aoIntensity: 1.2,
      matchedPresetId: 'oak-wood',
    };
  }

  if (p.includes('concreto') || p.includes('cimento') || p.includes('betão')) {
    return {
      name: 'Concreto Arquitetônico Aparente',
      category: 'Concreto',
      description: 'Superfície de concreto desformado com agregados minerais e microporos.',
      patternType: 'concrete',
      primaryColor: '#a6a8ab',
      secondaryColor: '#8c8e91',
      veinOrJointColor: '#4f5052',
      highlightColor: '#d1d3d6',
      ior: 1.53,
      metallic: 0.0,
      baseRoughness: 0.78,
      specularLevel: 0.4,
      displacementScale: 0.025,
      normalStrength: 2.6,
      normalFormat: 'OpenGL',
      aoIntensity: 1.4,
      matchedPresetId: 'concreto-aparente',
    };
  }

  if (p.includes('granito')) {
    return {
      name: 'Granito Polido Cristalino',
      category: 'Granitos',
      description: 'Rocha ígnea com cristais de quartzo, feldspato e lâminas de mica.',
      patternType: 'granite',
      primaryColor: '#c4c4c7',
      secondaryColor: '#7e8085',
      veinOrJointColor: '#2b2c2e',
      highlightColor: '#ffffff',
      ior: 1.6,
      metallic: 0.0,
      baseRoughness: 0.16,
      specularLevel: 0.82,
      displacementScale: 0.01,
      normalStrength: 1.5,
      normalFormat: 'OpenGL',
      aoIntensity: 1.0,
      matchedPresetId: 'granito-cinza',
    };
  }

  if (p.includes('tecido') || p.includes('linho') || p.includes('jeans') || p.includes('algodão') || p.includes('pano')) {
    const isJeans = p.includes('jeans') || p.includes('denim');
    return {
      name: isJeans ? 'Tecido Denim Índigo' : 'Tecido Trama Têxtil',
      category: 'Tecidos',
      description: 'Superfície têxtil com trama entrelaçada de urdume e trama.',
      patternType: 'fabric_weave',
      primaryColor: isJeans ? '#283d5a' : '#d8d2c4',
      secondaryColor: isJeans ? '#1c2b40' : '#b8b09f',
      veinOrJointColor: isJeans ? '#6a84a6' : '#736d63',
      highlightColor: '#ffffff',
      ior: 1.48,
      metallic: 0.0,
      baseRoughness: 0.85,
      specularLevel: 0.28,
      displacementScale: 0.015,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      aoIntensity: 1.5,
      matchedPresetId: 'tecido-linho',
    };
  }

  if (p.includes('metal') || p.includes('aço') || p.includes('aco') || p.includes('ferro') || p.includes('ouro') || p.includes('cobre') || p.includes('alumínio') || p.includes('latão')) {
    const isGold = p.includes('ouro') || p.includes('gold');
    const isCopper = p.includes('cobre') || p.includes('bronze');
    return {
      name: isGold ? 'Ouro Escovado Nobre' : isCopper ? 'Cobre Escovado' : 'Aço Inox Escovado',
      category: 'Metal',
      description: 'Superfície metálica com ranhuras direcionais e reflexão anisotrópica.',
      patternType: 'metal_brushed',
      primaryColor: isGold ? '#d4af37' : isCopper ? '#b87333' : '#c0c2c4',
      secondaryColor: isGold ? '#aa8c2c' : isCopper ? '#8c4b18' : '#9ca0a3',
      veinOrJointColor: '#404040',
      highlightColor: isGold ? '#ffe680' : isCopper ? '#ffaa73' : '#f0f0f0',
      ior: isGold ? 0.47 : 2.7,
      metallic: 1.0,
      baseRoughness: 0.28,
      specularLevel: 0.95,
      displacementScale: 0.005,
      normalStrength: 1.8,
      normalFormat: 'OpenGL',
      aoIntensity: 0.8,
      matchedPresetId: isGold ? 'ouro-polido' : 'aco-escovado',
    };
  }

  if (p.includes('asfalto') || p.includes('piche') || p.includes('estrada')) {
    return {
      name: 'Asfalto Betuminoso com Brita',
      category: 'Asfalto',
      description: 'Pavimento rodoviário com agregados britados e ligante betuminoso.',
      patternType: 'asphalt',
      primaryColor: '#3a3a3d',
      secondaryColor: '#262629',
      veinOrJointColor: '#121214',
      highlightColor: '#6e7075',
      ior: 1.55,
      metallic: 0.0,
      baseRoughness: 0.88,
      specularLevel: 0.35,
      displacementScale: 0.035,
      normalStrength: 3.4,
      normalFormat: 'OpenGL',
      aoIntensity: 1.5,
      matchedPresetId: 'asfalto-novo',
    };
  }

  if (p.includes('grama') || p.includes('vegeta') || p.includes('musgo') || p.includes('folha') || p.includes('jardim')) {
    return {
      name: 'Grama Natural Densa',
      category: 'Vegetação',
      description: 'Cobertura vegetal verde com folhas finas e dispersão biológica.',
      patternType: 'vegetation',
      primaryColor: '#4a8228',
      secondaryColor: '#2e5614',
      veinOrJointColor: '#1d330c',
      highlightColor: '#80ba48',
      ior: 1.42,
      metallic: 0.0,
      baseRoughness: 0.88,
      specularLevel: 0.24,
      displacementScale: 0.05,
      normalStrength: 3.6,
      normalFormat: 'OpenGL',
      aoIntensity: 1.6,
      matchedPresetId: 'grama-natural',
    };
  }

  if (p.includes('água') || p.includes('agua') || p.includes('líquido') || p.includes('liquido') || p.includes('piscina')) {
    return {
      name: 'Água Cristalina com Ondulações',
      category: 'Líquidos',
      description: 'Lâmina d’água translúcida com perturbações fluidas e reflexo.',
      patternType: 'water_waves',
      primaryColor: '#1d8fa8',
      secondaryColor: '#0a5263',
      veinOrJointColor: '#03232b',
      highlightColor: '#96e8ff',
      ior: 1.333,
      metallic: 0.0,
      baseRoughness: 0.05,
      specularLevel: 0.95,
      displacementScale: 0.04,
      normalStrength: 2.6,
      normalFormat: 'OpenGL',
      aoIntensity: 0.6,
      matchedPresetId: 'agua-cristalina',
    };
  }

  if (p.includes('piso') || p.includes('cerâmica') || p.includes('ceramica') || p.includes('porcelanato') || p.includes('ladrilho') || p.includes('azulejo')) {
    return {
      name: 'Porcelanato Polido em Placas',
      category: 'Pisos e Revestimentos',
      description: 'Revestimento cerâmico esmaltado de alta densidade com juntas finas.',
      patternType: 'tiles',
      primaryColor: '#e0ded9',
      secondaryColor: '#c9c6be',
      veinOrJointColor: '#827d75',
      highlightColor: '#ffffff',
      ior: 1.55,
      metallic: 0.0,
      baseRoughness: 0.15,
      specularLevel: 0.85,
      displacementScale: 0.012,
      normalStrength: 1.6,
      normalFormat: 'OpenGL',
      aoIntensity: 1.1,
      matchedPresetId: 'ceramica-hidraulica',
    };
  }

  if (p.includes('pedra') || p.includes('ardósia') || p.includes('ardosia') || p.includes('ferro') || p.includes('rocha')) {
    return {
      name: 'Pedra Natural Revestimento',
      category: 'Pedras',
      description: 'Face de pedra natural clivada com microrrelevo estratificado.',
      patternType: 'stone_blocks',
      primaryColor: '#69645b',
      secondaryColor: '#4f4b43',
      veinOrJointColor: '#2b2924',
      highlightColor: '#9c9587',
      ior: 1.56,
      metallic: 0.0,
      baseRoughness: 0.72,
      specularLevel: 0.44,
      displacementScale: 0.04,
      normalStrength: 3.2,
      normalFormat: 'OpenGL',
      aoIntensity: 1.5,
      matchedPresetId: 'pedra-ferro',
    };
  }

  // Generic architectural material fallback
  return {
    name: prompt ? prompt.slice(0, 32) : 'Material Arquitetônico PBR',
    category: 'Pinturas e Texturas',
    description: prompt || 'Superfície arquitetônica seamless com mapas PBR calculados.',
    patternType: 'plaster_stucco',
    primaryColor: '#d6d2cb',
    secondaryColor: '#b8b3ab',
    veinOrJointColor: '#5c5851',
    highlightColor: '#f2f0ec',
    ior: 1.5,
    metallic: 0.0,
    baseRoughness: 0.6,
    specularLevel: 0.45,
    displacementScale: 0.02,
    normalStrength: 2.2,
    normalFormat: 'OpenGL',
    aoIntensity: 1.2,
    matchedPresetId: 'cimento-queimado',
  };
}

/**
 * Endpoint to analyze a material prompt or image with Gemini Flash
 * and return physical PBR properties, material name, and shader parameters.
 */
app.post('/api/analyze-material', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    const fallbackClassification = classifyMaterialLocally(prompt || 'Textura');
    const ai = getAIClient();

    if (!ai) {
      return res.json({ material: fallbackClassification });
    }

    const systemInstruction = `You are an expert 3D PBR Material Artist and Technical Shader Specialist.
Analyze the user's material description or uploaded reference texture image.
You MUST classify the material into EXACTLY ONE of the following 18 categories:
${OFFICIAL_CATEGORIES.join(', ')}

Output STRICT JSON with physical PBR values:
{
  "name": "Concise Descriptive Title in Portuguese (max 35 chars)",
  "category": "Must be EXACTLY one from the 18 categories list",
  "description": "Short Portuguese technical description (max 100 chars)",
  "patternType": "one of: marble | wood_planks | wood_slats | bricks | tiles | stone_blocks | granite | concrete | asphalt | metal_brushed | fabric_weave | leather | plaster_stucco | water_waves | vegetation | rubber | terrazzo | generic",
  "primaryColor": "#hex code for dominant color",
  "secondaryColor": "#hex code for secondary variation color",
  "veinOrJointColor": "#hex code for veins, grout, joints, or grain",
  "highlightColor": "#hex code for highlights or flecks",
  "ior": number (Index of refraction, e.g. 1.33 for water, 1.5 to 1.6 for stones/dielectrics, 2.5 for metals),
  "metallic": number (0.0 for dielectrics/wood/stone/fabric, 1.0 for pure metals),
  "baseRoughness": number (0.05 for glass/polished marble to 0.95 for rough fabric/brick),
  "specularLevel": number (0.2 to 0.95, default 0.5 for dielectrics),
  "displacementScale": number (recommended height scale in meters, e.g. 0.008 for polished surfaces, 0.045 for deep bricks),
  "normalStrength": number (1.0 to 4.0),
  "normalFormat": "OpenGL",
  "aoIntensity": number (0.8 to 1.8),
  "transparency": number (0.0 for opaque, 0.1 to 0.95 for sheer fabric/water/glass),
  "emissiveIntensity": number (0.0 for non-emissive, 1.0 to 5.0 for glowing/LEDs),
  "matchedPresetId": "string or null"
}`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const textQuery = prompt
      ? `Classify and analyze this material description into one of the 18 categories and determine PBR properties: "${prompt}"`
      : 'Analyze this texture image into one of the 18 categories and determine PBR properties.';
    parts.push({ text: textQuery });

    // Helper with timeout to prevent blocking on network latency
    const callWithTimeout = <T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)),
      ]);
    };

    // Attempt generation with primary model, then secondary model if high demand
    let text = '';
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        4500
      );
      text = response.text?.trim() || '';
    } catch (primaryErr: any) {
      console.warn('Gemini 3.8 Flash unavailable or timeout, trying gemini-3.1-flash-lite...', primaryErr.message);
      try {
        const responseLite = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          }),
          3500
        );
        text = responseLite.text?.trim() || '';
      } catch (secondaryErr: any) {
        console.warn('Gemini models unavailable, utilizing intelligent local classifier:', secondaryErr.message);
      }
    }

    if (text) {
      try {
        const parsed = JSON.parse(text);
        // Ensure valid category
        if (!OFFICIAL_CATEGORIES.includes(parsed.category)) {
          parsed.category = fallbackClassification.category;
        }
        return res.json({ material: { ...fallbackClassification, ...parsed } });
      } catch (err) {
        console.warn('Could not parse JSON from Gemini response, using fallback classification');
      }
    }

    return res.json({ material: fallbackClassification });
  } catch (error: any) {
    console.error('Error analyzing material:', error);
    // Never fail with 500, always return valid fallback
    const local = classifyMaterialLocally(req.body?.prompt || '');
    return res.json({ material: local });
  }
});

/**
 * Endpoint to generate a base texture image using Gemini image generation if key is present
 */
app.post('/api/generate-texture-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        error: 'Chave GEMINI_API_KEY não configurada no painel Settings > Secrets',
      });
    }

    const fullPrompt = `Top-down direct flat architectural texture photograph of ${prompt}, perfectly uniform overhead lighting, flat scan, no shadows, no perspective distortion, seamless tileable surface pattern, hyper-detailed 8k texture reference.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let generatedImageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedImageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({ error: 'Nenhuma imagem foi retornada pelo modelo.' });
    }

    return res.json({ imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Error generating texture image:', error);
    return res.status(500).json({ error: error.message || 'Erro ao gerar imagem de textura.' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PBR Texture Generator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
