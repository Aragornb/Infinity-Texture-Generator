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

O **Infinity Texture Generator** é uma aplicação web **Open Core** que gera materiais PBR (Physically Based Rendering) tileáveis (seamless) sem depender de bibliotecas de texturas prontas. A partir de uma descrição em texto (ex.: *"mármore Calacatta com veios dourados"*) ou de uma imagem de referência enviada pelo usuário, o app:

1. Classifica o material (categoria, cor, rugosidade, IOR, metalicidade etc.) usando um **classificador local determinístico** (núcleo aberto e 100% offline) ou, opcionalmente, a **API Gemini** para uma interpretação mais rica do prompt;
2. Sintetiza proceduralmente uma textura base seamless no canvas;
3. Deriva todos os mapas PBR (Normal, Roughness, Especular, Displacement, AO) a partir dessa base;
4. Renderiza um preview 3D fisicamente correto em tempo real; e
5. Exporta o pacote completo, já configurado para o software 3D de sua escolha.

Todo o processamento de imagem acontece no **Canvas 2D do navegador** — não há geração de imagem por IA nem dependência de texturas externas; quando habilitada, a IA é usada apenas para interpretar a descrição do material e definir seus parâmetros físicos.

## 🧩 Arquitetura Open Core

O projeto é **open core**: o motor completo de geração de texturas (síntese procedural, derivação de mapas PBR, presets, preview 3D e exportação) é **100% aberto, gratuito e funcional offline**, sem nenhuma dependência de nuvem ou serviço pago. A camada de IA generativa (classificação de materiais via Gemini) é uma **camada opcional** que pode ser ativada de três formas, configuráveis pelo próprio usuário no ícone de engrenagem (⚙️) da interface:

| Modo | Onde a chave fica | Como habilitar |
|---|---|---|
| 🖥️ **Núcleo local (padrão)** | Nenhuma chave necessária | Funciona imediatamente — classificador determinístico local, 100% offline |
| 🌐 **Servidor (`.env`)** | No servidor, via `GEMINI_API_KEY` | Recomendado para self-hosting em sua própria máquina/container |
| 🔑 **Navegador (BYOK)** | No `localStorage` do navegador do usuário | Cole sua própria chave da API Gemini direto na interface, sem precisar rodar o servidor via terminal |

Ou seja: **nenhuma funcionalidade do núcleo é paga ou bloqueada** — a IA é apenas um complemento opcional que usa a cota/chave do próprio usuário (BYOK — *Bring Your Own Key*) com o Google AI Studio, e não um serviço mantido ou cobrado por este projeto.

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
- **Painel de configuração Open Core** (⚙️) — escolha entre classificador local, chave de servidor (`.env`) ou sua própria chave Gemini salva no navegador, com teste de conexão integrado.

## 🖥️ Como funciona

```
Prompt de texto  ──┐
                    ├──► Classificador local (núcleo aberto)  ──┐
Imagem enviada   ──┘        ou IA Gemini (opcional/BYOK)        ├──► Propriedades físicas do material
                                                                  │
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

Por padrão, o app usa o **classificador local determinístico** (baseado em palavras-chave em português), que é parte do núcleo aberto e funciona 100% offline. Se o usuário configurar uma `GEMINI_API_KEY` — no servidor (`.env`) ou na própria interface (localStorage) — a classificação passa a usar a IA generativa para interpretações mais ricas do prompt/imagem. Se a chamada à IA falhar, o app volta automaticamente ao classificador local.

## 🚀 Instalação

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18+ (ou [Bun](https://bun.sh/), já que o projeto inclui `bun.lock`)

1. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/seu-usuario/infinity-texture-generator.git
   cd infinity-texture-generator
   npm install
   ```

2. **(Opcional)** Configure sua chave da API Gemini para habilitar a classificação por IA generativa. O app funciona normalmente sem isso, usando o classificador local do núcleo aberto.
   ```bash
   cp .env.example .env.local
   ```
   ```env
   GEMINI_API_KEY="sua-chave-da-api-gemini"
   ```
   > Alternativamente, você pode colar sua própria chave diretamente na interface (ícone ⚙️ no topo), sem precisar editar arquivos nem rodar o servidor via terminal — ela fica salva apenas no `localStorage` do seu navegador.

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
│   │   ├── ApiKeySettingsModal.tsx # Painel Open Core: modo local / servidor / chave própria (BYOK)
│   │   └── LanguageSelector.tsx    # Seletor de idioma
│   ├── utils/
│   │   ├── pbrGenerator.ts         # Derivação dos mapas PBR a partir da base
│   │   ├── proceduralSynth.ts      # Síntese procedural da textura base seamless
│   │   ├── presets.ts              # Presets de materiais
│   │   ├── materialTypePresets.ts  # Presets por tipo/categoria
│   │   ├── softwareGuides.ts       # Geração das configurações por software 3D
│   │   ├── apiKeyStorage.ts        # Gerenciamento da chave Gemini no localStorage (BYOK)
│   │   └── zipExporter.ts          # Empacotamento e download em ZIP
│   └── i18n/                       # Traduções (PT, EN, ES, ZH, JA)
└── metadata.json
```

## 🌍 Idiomas suportados

🇧🇷 Português (BR) · 🇺🇸 English · 🇪🇸 Español · 🇨🇳 简体中文 · 🇯🇵 日本語

## 📄 Licença

Este projeto segue um modelo **Open Core**:

- **Núcleo (core)** — todo o motor de geração de texturas PBR (síntese procedural, derivação de mapas, presets, preview 3D, inspetor 2D, exportação ZIP e guias de configuração por software) é **código aberto**, licenciado sob a **[GNU General Public License v3.0 (GPLv3)](LICENSE)**. Isso significa que qualquer pessoa pode usar, estudar, modificar e redistribuir o código, **desde que** qualquer trabalho derivado/redistribuído também seja disponibilizado sob a GPLv3 (copyleft) — incluindo o código-fonte correspondente. Consulte o arquivo [`LICENSE`](LICENSE) para o texto integral.
- **Camada de IA opcional** — a classificação de materiais via API Gemini **não é um recurso pago por este projeto**: ela depende de uma chave da API do Google AI Studio fornecida pelo próprio usuário (BYOK), sujeita aos termos e à política de preços do Google. O código dessa integração (`server.ts`, `ApiKeySettingsModal.tsx`, `apiKeyStorage.ts`) está incluído no mesmo repositório e sob a mesma licença GPLv3 — o "core" não é artificialmente limitado, apenas o uso da IA depende de uma chave externa.

> ⚠️ **Nota sobre a GPLv3**: por ser uma licença *copyleft forte*, qualquer software que incorpore ou derive deste código (inclusive versões modificadas hospedadas/distribuídas por terceiros) também deve ser distribuído sob a GPLv3, com código-fonte disponível. Se no futuro você pretende oferecer um "core" livre e um módulo comercial/proprietário separado (o modelo open core mais comum em produtos SaaS), avalie se a GPLv3 é a escolha certa para o núcleo — ela impede que terceiros criem forks fechados/proprietários, mas também impõe essa mesma obrigação a qualquer parte comercial que venha a ser construída diretamente sobre esse código. Nesses casos, é comum consultar um profissional jurídico antes de definir a estrutura final de licenciamento.
