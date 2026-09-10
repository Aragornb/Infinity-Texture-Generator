<div align="center">

# ♾️ Infinity Texture Generator

**Gerador avançado de texturas PBR seamless com síntese procedural e IA**

Crie mapas PBR completos (Albedo, Normal, Roughness, Especular, Displacement e AO) a partir de um prompt de texto ou de uma imagem de referência, com preview 3D físico em tempo real e exportação pronta para Blender, V-Ray, Unity e Unreal Engine.

[Funcionalidades](#-funcionalidades) •
[Como funciona](#-como-funciona) •
[Instalação](#-instalação) •
[Uso](#-uso) •
[Exportação](#-exportação-para-softwares-3d) •
[Stack](#-stack-técnica)

</div>

---

## 📖 Sobre

O **Infinity Texture Generator** é uma aplicação web que gera materiais PBR (Physically Based Rendering) tileáveis (seamless) sem depender de bibliotecas de texturas prontas. A partir de uma descrição em texto (ex.: *"mármore Calacatta com veios dourados"*) ou de uma imagem de referência enviada pelo usuário, o app:

1. Classifica o material (categoria, cor, rugosidade, IOR, metalicidade etc.) usando a API Gemini, com um classificador local determinístico como fallback offline;
2. Sintetiza proceduralmente uma textura base seamless no canvas;
3. Deriva todos os mapas PBR (Normal, Roughness, Especular, Displacement, AO) a partir dessa base;
4. Renderiza um preview 3D fisicamente correto em tempo real; e
5. Exporta o pacote completo, já configurado para o software 3D de sua escolha.

Todo o processamento de imagem acontece no **Canvas 2D do navegador** — não há geração de imagem por IA nem dependência de texturas externas; a IA é usada apenas para interpretar a descrição do material e definir seus parâmetros físicos.

## ✨ Funcionalidades

- **Geração por prompt de texto** — descreva o material desejado em linguagem natural e a IA (Gemini) infere categoria, cores, rugosidade, IOR, metalicidade e demais propriedades físicas.
- **Geração a partir de imagem** — envie uma foto ou textura de referência (upload ou drag-and-drop) para extrair o material base.
- **+30 presets de materiais** prontos, organizados em 18 categorias (Madeira, Mármores, Metal, Tecidos, Concreto, Vegetação, Líquidos, Pisos e Revestimentos, entre outras).
- **Mapas PBR completos**: Diffuse/Albedo, Especular, Normal, Roughness, Displacement e Ambient Occlusion (AO).
- **Seamless tiling real** — blending de bordas configurável para texturas 100% tileáveis, sem costuras visíveis.
- **Preview 3D físico em tempo real**, renderizado com Three.js, refletindo instantaneamente qualquer ajuste fino.
- **Ajuste fino de parâmetros físicos**: IOR, metalicidade, rugosidade base, nível especular, escala de displacement, intensidade do normal, formato do normal (OpenGL/DirectX), tiling, transparência/transmissão e emissão.
- **Resoluções configuráveis**: 1024×1024, 2048×2048 ou 4096×4096.
- **Inspetor de mapas 2D** para visualizar cada mapa individualmente antes da exportação.
- **Exportação em ZIP** com todos os mapas em JPG, prontos para uso.
- **Guias e configuração automática por software**: Blender (com script Python de montagem de nós em 1 clique), V-Ray, Unity (URP/HDRP) e Unreal Engine.
- **Interface multi-idioma**: Português (BR), English, Español, 简体中文 e 日本語.

## 🖥️ Como funciona

```
Prompt de texto  ──┐
                    ├──► Classificação IA (Gemini) ──► Propriedades físicas do material
Imagem enviada   ──┘                                            │
                                                                  ▼
                                          Síntese procedural (Canvas 2D)
                                                                  │
                                                                  ▼
                                    Derivação dos mapas PBR (Normal, Roughness,
                                       Especular, Displacement, AO)
                                                                  │
                                                                  ▼
                                    Preview 3D físico (Three.js) + Inspetor 2D
                                                                  │
                                                                  ▼
                              Exportação ZIP + configuração para Blender / V-Ray / Unity / Unreal
```

Se a `GEMINI_API_KEY` não estiver configurada, ou a chamada à IA falhar, um **classificador local determinístico** (baseado em palavras-chave em português) assume a interpretação do prompt, garantindo que a aplicação continue funcional offline.

## 🚀 Instalação

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18+ (ou [Bun](https://bun.sh/), já que o projeto inclui `bun.lock`)

1. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/seu-usuario/infinity-texture-generator.git
   cd infinity-texture-generator
   npm install
   ```

2. Configure sua chave da API Gemini. Copie o arquivo de exemplo e edite os valores:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   GEMINI_API_KEY="sua-chave-da-api-gemini"
   ```
   > A chave é usada apenas no servidor para classificar materiais a partir do prompt/imagem. Sem ela, o app funciona normalmente usando o classificador local como fallback.

3. Rode o app em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   O servidor Express + Vite (`server.ts`) sobe em `http://localhost:3000`.

### Build de produção

```bash
npm run build   # gera o bundle do cliente (Vite) e do servidor (esbuild)
npm run start   # roda o servidor de produção em dist/server.cjs
```

### Outros scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção (cliente + servidor) |
| `npm run start` | Executa o build de produção |
| `npm run preview` | Preview do build do Vite |
| `npm run lint` | Checagem de tipos com `tsc --noEmit` |
| `npm run clean` | Remove artefatos de build |

## 🎮 Uso

1. **Descreva ou envie uma referência**: digite um prompt (ex.: *"piso de concreto polido cinza claro"*) ou arraste uma imagem para a área de upload.
2. **Aguarde a síntese**: os seis mapas PBR são gerados automaticamente na resolução escolhida.
3. **Ajuste fino**: use os controles de IOR, rugosidade, metalicidade, normal, displacement, tiling, transparência e emissão para refinar o material.
4. **Inspecione**: alterne entre os mapas no inspetor 2D e observe o resultado no preview 3D em tempo real.
5. **Exporte**: baixe o pacote ZIP com todos os mapas, ou vá até a aba de configuração de software para copiar os parâmetros/scripts prontos para o seu motor de renderização.

## 📦 Exportação para softwares 3D

O app gera automaticamente instruções e parâmetros específicos para:

- **Blender** — colorspaces recomendados por mapa, configuração do nó Principled BSDF e um **script Python (`setup_pbr_blender.py`)** para montar a árvore de nós com um clique.
- **V-Ray** — configurações do VRayMtl e do modificador de displacement.
- **Unity** (URP/HDRP) — workflow Metallic/Smoothness ou Specular, configurações de import de textura e parâmetros de material.
- **Unreal Engine** — configurações de sampler, compressão de textura e parâmetros do material.

## 🛠️ Stack técnica

- **React 19** + **TypeScript**
- **Vite 6** (build/dev server) + **Express** (servidor Node para a API)
- **Three.js** — preview 3D físico em tempo real
- **@google/genai** (Gemini API) — classificação inteligente de materiais a partir de texto/imagem
- **Tailwind CSS 4**
- **JSZip** — empacotamento dos mapas exportados
- **lucide-react** — ícones
- **motion** — animações

## 📁 Estrutura do projeto

```
├── server.ts                       # Servidor Express + integração Gemini + classificador local
├── src/
│   ├── App.tsx                     # Componente raiz e orquestração do fluxo
│   ├── types.ts                    # Tipos principais (MaterialProperties, PBRMapData, etc.)
│   ├── components/
│   │   ├── PromptOrUpload.tsx      # Entrada por prompt ou upload de imagem
│   │   ├── MaterialPreview.tsx     # Preview 3D físico (Three.js)
│   │   ├── MapInspector2D.tsx      # Inspetor individual dos mapas PBR
│   │   ├── MapControls.tsx         # Controles de ajuste fino dos parâmetros físicos
│   │   ├── SoftwareConfigView.tsx  # Configurações/scripts para Blender, V-Ray, Unity, Unreal
│   │   └── LanguageSelector.tsx    # Seletor de idioma
│   ├── utils/
│   │   ├── pbrGenerator.ts         # Derivação dos mapas PBR a partir da base
│   │   ├── proceduralSynth.ts      # Síntese procedural da textura base seamless
│   │   ├── presets.ts              # Presets de materiais
│   │   ├── materialTypePresets.ts  # Presets por tipo/categoria
│   │   ├── softwareGuides.ts       # Geração das configurações por software 3D
│   │   └── zipExporter.ts          # Empacotamento e download em ZIP
│   └── i18n/                       # Traduções (PT, EN, ES, ZH, JA)
└── metadata.json
```

## 🌍 Idiomas suportados

🇧🇷 Português (BR) · 🇺🇸 English · 🇪🇸 Español · 🇨🇳 简体中文 · 🇯🇵 日本語

## 📄 Licença

Defina aqui a licença do projeto (ex.: MIT). Nenhuma licença foi especificada ainda.
