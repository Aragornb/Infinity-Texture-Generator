import React, { useEffect, useRef, useState } from 'react';
import { MaterialProperties, PBRMapData, TextureResolution } from './types';
import { generatePBRMaps, loadImage } from './utils/pbrGenerator';
import { generateProceduralDiffuseCanvas } from './utils/proceduralSynth';
import { exportPBRBundleZip, triggerBlobDownload } from './utils/zipExporter';
import { MapInspector2D } from './components/MapInspector2D';
import { MapControls } from './components/MapControls';
import { SoftwareConfigView } from './components/SoftwareConfigView';
import { PromptOrUpload } from './components/PromptOrUpload';
import { MaterialPreview } from './components/MaterialPreview';
import { Archive, CheckCircle2, Info, Loader2 } from 'lucide-react';

const GENERIC_DEFAULT_MATERIAL: MaterialProperties = {
  name: 'Material Padrão (Genérico)',
  category: 'Genérico',
  description: 'Superfície padrão neutra sem textura ou material aplicado.',
  displacementScale: 0.0,
  normalStrength: 1.0,
  baseRoughness: 0.5,
  specularLevel: 0.5,
  metallic: 0.0,
  ior: 1.5,
  normalFormat: 'OpenGL',
  seamlessBlendWidth: 0.18,
  seamlessTiling: 2,
  transparency: 0.0,
  emissiveIntensity: 0.0,
  emissiveColor: '#ffffff',
};

export default function App() {
  // Current Material Properties and Baseline Initial State
  const [material, setMaterial] = useState<MaterialProperties>(GENERIC_DEFAULT_MATERIAL);
  const [initialMaterial, setInitialMaterial] = useState<MaterialProperties>(GENERIC_DEFAULT_MATERIAL);
  const [resolution, setResolution] = useState<TextureResolution>(2048);

  // Active Base Canvas / Image
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generated PBR Maps (base64 data URLs)
  const [maps, setMaps] = useState<PBRMapData | null>(null);

  // Loading & Processing States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{ percent: number; message: string }>({
    percent: 0,
    message: '',
  });

  // Reset completely to default generic material (neutral surface with no material applied)
  const handleClearToGeneric = async () => {
    const canvas = generateProceduralDiffuseCanvas(
      {
        patternType: 'generic',
        primaryColor: '#cfd2d8',
        secondaryColor: '#cfd2d8',
      },
      resolution
    );
    baseCanvasRef.current = canvas;
    setMaterial(GENERIC_DEFAULT_MATERIAL);
    setInitialMaterial(GENERIC_DEFAULT_MATERIAL);
    await computeMapsFromCanvas(canvas, GENERIC_DEFAULT_MATERIAL, resolution);
  };

  // Initialize with generic neutral material on component mount
  useEffect(() => {
    handleClearToGeneric();
  }, []);

  // Compute PBR Maps from the stored base canvas
  const computeMapsFromCanvas = async (
    canvas: HTMLCanvasElement,
    props: MaterialProperties,
    res: TextureResolution
  ) => {
    setIsProcessing(true);
    setStatusMessage(`Sintetizando mapas PBR seamless em ${res}x${res}...`);

    try {
      // Small timeout to allow UI rendering of loader
      await new Promise((resolve) => setTimeout(resolve, 30));

      const generatedMaps = await generatePBRMaps(canvas, props, res);
      setMaps(generatedMaps);
      setStatusMessage('');
    } catch (error: any) {
      console.error('Error generating PBR maps:', error);
      setStatusMessage('Erro ao processar mapas PBR: ' + (error.message || 'Falha no canvas'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to initial settings of current generated material
  const handleResetToInitial = async () => {
    if (!initialMaterial) return;
    const restored = { ...initialMaterial };
    setMaterial(restored);
    if (baseCanvasRef.current) {
      await computeMapsFromCanvas(baseCanvasRef.current, restored, resolution);
    }
  };

  // Recompute maps when fine-tuning parameters change
  const handleRecomputeMaps = async () => {
    if (!baseCanvasRef.current) return;
    await computeMapsFromCanvas(baseCanvasRef.current, material, resolution);
  };

  // Change resolution
  const handleResolutionChange = async (newRes: TextureResolution) => {
    setResolution(newRes);
    if (!baseCanvasRef.current) return;
    await computeMapsFromCanvas(baseCanvasRef.current, material, newRes);
  };

  // Handle Uploaded Reference Image
  const handleUploadImage = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage('Carregando e analisando imagem de referência com IA...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const img = await loadImage(dataUrl);

        // Draw onto base canvas
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, resolution, resolution);
        }
        baseCanvasRef.current = canvas;

        // Query backend Gemini AI to extract physical PBR properties
        let updatedProperties: MaterialProperties = {
          ...material,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: 'Personalizado',
          description: `Material gerado a partir da imagem carregada: ${file.name}`,
        };

        try {
          const res = await fetch('/api/analyze-material', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: dataUrl,
              prompt: file.name.replace(/\.[^/.]+$/, ''),
            }),
          });
          const json = await res.json();
          if (json.material) {
            updatedProperties = {
              ...updatedProperties,
              ...json.material,
              seamlessBlendWidth: 0.18,
              seamlessTiling: 2,
            };
          }
        } catch (aiErr) {
          console.warn('Gemini analysis error, using defaults:', aiErr);
        }

        setMaterial(updatedProperties);
        setInitialMaterial(updatedProperties);
        await computeMapsFromCanvas(canvas, updatedProperties, resolution);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error handling upload:', err);
      setStatusMessage('Erro ao carregar imagem: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Handle Natural Language Prompt
  const handleGenerateFromPrompt = async (prompt: string) => {
    setIsProcessing(true);
    setStatusMessage('Consultando IA para síntese física e procedural do material...');

    try {
      // 1. Analyze prompt with Gemini
      let pbrProps: MaterialProperties = {
        ...material,
        name: prompt.slice(0, 40),
        description: `Material PBR gerado via IA para: "${prompt}"`,
      };

      try {
        const response = await fetch('/api/analyze-material', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        if (data.material) {
          pbrProps = {
            ...pbrProps,
            ...data.material,
            seamlessBlendWidth: 0.18,
            seamlessTiling: 2,
          };
        }
      } catch (err) {
        console.warn('Analysis error:', err);
      }

      // 2. Synthesize photorealistic procedural diffuse texture tailored to AI classification
      const mat = pbrProps as any;
      const canvas = generateProceduralDiffuseCanvas(
        {
          patternType: mat.patternType || 'plaster_stucco',
          primaryColor: mat.primaryColor || '#c89d6e',
          secondaryColor: mat.secondaryColor || '#a77a4b',
          veinOrJointColor: mat.veinOrJointColor || '#2b1d12',
          highlightColor: mat.highlightColor || '#ffffff',
        },
        resolution
      );

      baseCanvasRef.current = canvas;
      setMaterial(pbrProps);
      setInitialMaterial(pbrProps);
      await computeMapsFromCanvas(canvas, pbrProps, resolution);
    } catch (err: any) {
      console.error('Error generating from prompt:', err);
      setStatusMessage('Erro ao processar prompt: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Download Comprehensive ZIP Package
  const handleDownloadZip = async () => {
    if (!maps) return;
    setIsExportingZip(true);
    setZipProgress({ percent: 5, message: 'Iniciando empacotamento das texturas...' });

    try {
      const zipBlob = await exportPBRBundleZip(
        material,
        maps,
        resolution,
        (percent, message) => {
          setZipProgress({ percent, message });
        }
      );

      const safeName = material.name.toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
      const filename = `${safeName}_PBR_${resolution}K_bundle.zip`;
      triggerBlobDownload(zipBlob, filename);
    } catch (err: any) {
      console.error('Error exporting zip:', err);
      alert('Erro ao gerar arquivo ZIP: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-gray-300 flex flex-col selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
      {/* Background ambient radial glow and tech dots */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,#151922_0%,#050608_80%)]" />
      <div className="fixed inset-0 pointer-events-none tech-dots opacity-20" />

      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0A0B10]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 sm:px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-black text-lg glow-cyan-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Texture<span className="text-cyan-400">Gen</span>.AI
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full tracking-wider uppercase">
                  4K PBR
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                Difusão · Especular · Normal · Rugosidade · Deslocamento · Blender · Unreal · Unity · V-Ray
              </p>
            </div>
          </div>

          {/* Quick System Indicators & Download Full Bundle Button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-gray-400 uppercase tracking-wider">Engine:</span>
              <span className="text-cyan-400 font-semibold uppercase">PBR Canvas + Sobel 4K</span>
            </div>

            <button
              type="button"
              id="btn-download-full-zip"
              onClick={handleDownloadZip}
              disabled={isExportingZip || isProcessing || !maps}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-bold rounded-md flex items-center gap-2 text-xs transition-all glow-cyan disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isExportingZip ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              ) : (
                <Archive className="w-3.5 h-3.5 text-black" />
              )}
              <span>
                {isExportingZip
                  ? zipProgress.message || 'Compactando...'
                  : 'EXPORT BUNDLE (4K)'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 relative z-10">
        {/* Creation Bar: Prompt OR Reference Image Upload */}
        <section id="section-prompt-upload">
          <PromptOrUpload
            isGenerating={isProcessing}
            onGenerateFromPrompt={handleGenerateFromPrompt}
            onUploadImage={handleUploadImage}
          />
        </section>

        {/* Processing Indicator Banner */}
        {isProcessing && (
          <div className="glass-cyan p-3.5 rounded-xl text-cyan-300 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span className="font-mono text-cyan-200 text-[11px] tracking-wide">
                {statusMessage || 'Sintetizando mapas PBR procedurais sem emendas...'}
              </span>
            </div>
            <div className="w-28 h-1.5 bg-cyan-950/80 rounded-full overflow-hidden border border-cyan-500/30 hidden sm:block">
              <div className="h-full bg-cyan-400 w-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Material Preview (Shader Ball / PBR mesh render on-demand) */}
        <section id="section-material-preview">
          <MaterialPreview
            maps={maps}
            material={material}
            isProcessing={isProcessing}
          />
        </section>

        {/* 2D Seamless Map Inspection Section */}
        {maps && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">
                Inspeção dos Mapas PBR Individuais & Repetição Seamless 2D
              </span>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                100% Seamless Tileable
              </span>
            </div>
            <MapInspector2D
              maps={maps}
              materialName={material.name}
              normalFormat={material.normalFormat}
            />
          </div>
        )}

        {/* Fine-Tuning Controls & Resolution Options */}
        <section id="section-map-controls">
          <MapControls
            material={material}
            resolution={resolution}
            isProcessing={isProcessing}
            onMaterialChange={(updated) => setMaterial((prev) => ({ ...prev, ...updated }))}
            onResolutionChange={handleResolutionChange}
            onRecomputeMaps={handleRecomputeMaps}
            onResetToInitial={handleResetToInitial}
            onClearToDefault={handleClearToGeneric}
          />
        </section>

        {/* Software Integration Guides & Script Exporter */}
        <section id="section-software-guides">
          <SoftwareConfigView
            material={material}
            resolution={resolution}
          />
        </section>

        {/* Export Info & Quick Steps */}
        <section className="glass rounded-xl p-4 text-xs text-gray-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-bold">Estrutura do Pacote ZIP Exportado</span>
          </div>
          <p className="leading-relaxed text-gray-400 text-[11px]">
            O arquivo comprimido contém todos os 5 mapas obrigatórios em JPEG de alta definição (Difusão/Albedo, Especular, Normal Tangent Space, Rugosidade, Deslocamento/Height e Oclusão Ambiental), o script Python de 1-clique para o Blender (<code className="text-cyan-300 font-mono">setup_pbr_blender.py</code>), as especificações técnicas em <code className="text-cyan-300 font-mono">material_settings.json</code> e o guia completo em formato texto com o passo a passo para Blender, V-Ray, Unity e Unreal Engine (<code className="text-cyan-300 font-mono">MATERIAL_CONFIG_BLENDER_VRAY_UNITY_UNREAL.txt</code>).
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-[11px] text-gray-500 font-mono relative z-10">
        TextureGen.AI · Seamless PBR Texture Generator 4K · Immersive Studio Engine
      </footer>
    </div>
  );
}
