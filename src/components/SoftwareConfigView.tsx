import React, { useState } from 'react';
import { MaterialProperties, SoftwareConfig } from '../types';
import { Check, Copy, FileCode, FileText, HelpCircle, Layers, Monitor, Terminal } from 'lucide-react';
import { generateSoftwareConfig, generateUnifiedTextDoc } from '../utils/softwareGuides';

interface SoftwareConfigViewProps {
  material: MaterialProperties;
  resolution: number;
}

type SoftwareTab = 'blender' | 'unreal' | 'unity' | 'vray' | 'raw_doc';

export const SoftwareConfigView: React.FC<SoftwareConfigViewProps> = ({ material, resolution }) => {
  const [activeTab, setActiveTab] = useState<SoftwareTab>('blender');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const safeName = material.name.toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  const config = generateSoftwareConfig(material, safeName);
  const unifiedDoc = generateUnifiedTextDoc(material, safeName, config, resolution);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="w-full glass rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header with Software Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0A0B10]/95 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            INTEGRAÇÃO DIRETA NOS SOFTWARES 3D
          </span>
        </div>

        {/* Software Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-mono">
          <button
            type="button"
            id="tab-blender"
            onClick={() => setActiveTab('blender')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'blender' ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-md' : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Blender</span>
          </button>

          <button
            type="button"
            id="tab-unreal"
            onClick={() => setActiveTab('unreal')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'unreal' ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-md' : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Unreal Engine 5</span>
          </button>

          <button
            type="button"
            id="tab-unity"
            onClick={() => setActiveTab('unity')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'unity' ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-md' : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Unity</span>
          </button>

          <button
            type="button"
            id="tab-vray"
            onClick={() => setActiveTab('vray')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'vray' ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-md' : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>V-Ray</span>
          </button>

          <button
            type="button"
            id="tab-raw-doc"
            onClick={() => setActiveTab('raw_doc')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'raw_doc' ? 'bg-white/20 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Ver arquivo de texto completo TXT"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Guia TXT Completo</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-[#0A0B10]/60 max-h-[480px] overflow-y-auto text-gray-300 text-xs">
        {/* BLENDER TAB */}
        {activeTab === 'blender' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
              <div>
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Script Python de Automação para o Blender (1-Clique)
                </h4>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Cria o material completo e conecta todos os nós (Albedo sRGB, Roughness Non-Color, Normal Map, Displacement) automaticamente.
                </p>
              </div>
              <button
                type="button"
                id="copy-blender-script"
                onClick={() => copyToClipboard(config.blender.pythonScript, 'blender-script')}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-md flex items-center gap-1.5 transition-all glow-cyan-sm shrink-0 uppercase tracking-wider font-mono text-xs"
              >
                {copiedKey === 'blender-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'blender-script' ? 'Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 bg-black/90 border border-white/5 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48 leading-relaxed">
                {config.blender.pythonScript}
              </pre>
            </div>

            <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
              <h5 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                Passo a Passo Manual no Shader Editor:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11px] leading-relaxed font-sans">
                {config.blender.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* UNREAL ENGINE 5 TAB */}
        {activeTab === 'unreal' && (
          <div className="space-y-4">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">Configuração no Unreal Engine 5 (Lumen & Nanite)</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Parâmetros de compressão de textura e slots do Master Material.
                </p>
              </div>
              <button
                type="button"
                id="copy-unreal-settings"
                onClick={() => copyToClipboard(JSON.stringify(config.unreal, null, 2), 'unreal-settings')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0 font-mono text-xs border border-white/10"
              >
                {copiedKey === 'unreal-settings' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'unreal-settings' ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <h5 className="font-semibold text-cyan-400 mb-2 font-mono uppercase tracking-wider text-[11px]">Compressão e Espaço de Cor</h5>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Diffuse (Albedo):</span>
                    <span className="text-gray-200 font-mono">sRGB: Ligado (TC_Default)</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Normal Map:</span>
                    <span className="text-gray-200 font-mono">sRGB: Desligado (TC_Normalmap)</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Roughness / Specular:</span>
                    <span className="text-gray-200 font-mono">sRGB: Desligado (Linear)</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-gray-400">Displacement (Height):</span>
                    <span className="text-gray-200 font-mono">sRGB: Desligado (Linear)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <h5 className="font-semibold text-cyan-400 mb-2 font-mono uppercase tracking-wider text-[11px]">Parâmetros de Material</h5>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Metallic Scalar:</span>
                    <span className="text-gray-200 font-mono">{material.metallic.toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Roughness Default:</span>
                    <span className="text-gray-200 font-mono">{material.baseRoughness.toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Normal Strength:</span>
                    <span className="text-gray-200 font-mono">{material.normalStrength.toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-gray-400">WPO / Tessellation Scale:</span>
                    <span className="text-gray-200 font-mono">{Math.round(material.displacementScale * 100)} unidades</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
              <h5 className="font-semibold text-white mb-1.5 text-xs">Instruções de Importação no UE5:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11px] leading-relaxed">
                {config.unreal.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* UNITY TAB */}
        {activeTab === 'unity' && (
          <div className="space-y-4">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">Configuração no Unity (URP & HDRP Lit Shader)</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Importação de textura e ajustes do shader Standard / Lit.
                </p>
              </div>
              <button
                type="button"
                id="copy-unity-settings"
                onClick={() => copyToClipboard(JSON.stringify(config.unity, null, 2), 'unity-settings')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0 font-mono text-xs border border-white/10"
              >
                {copiedKey === 'unity-settings' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'unity-settings' ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="bg-black/50 p-3.5 rounded-lg border border-white/5 space-y-2">
              <h5 className="font-semibold text-cyan-400 font-mono uppercase tracking-wider text-[11px]">Valores no Inspector do Material Lit:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-black/40 p-2 rounded border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Workflow</span>
                  <span className="font-mono text-gray-100 font-semibold">Metallic</span>
                </div>
                <div className="bg-black/40 p-2 rounded border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Smoothness</span>
                  <span className="font-mono text-cyan-300 font-semibold">{(1.0 - material.baseRoughness).toFixed(2)}</span>
                </div>
                <div className="bg-black/40 p-2 rounded border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Normal Scale</span>
                  <span className="font-mono text-cyan-300 font-semibold">{material.normalStrength.toFixed(2)}</span>
                </div>
                <div className="bg-black/40 p-2 rounded border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Height Amp</span>
                  <span className="font-mono text-cyan-300 font-semibold">{material.displacementScale.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
              <h5 className="font-semibold text-white mb-1.5 text-xs">Instruções Passo a Passo no Unity:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11px] leading-relaxed">
                {config.unity.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* V-RAY TAB */}
        {activeTab === 'vray' && (
          <div className="space-y-4">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">Configuração no V-Ray (VRayMtl para 3ds Max / Maya)</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Canais de reflexão, VRayNormalMap e modificador VRayDisplacementMod.
                </p>
              </div>
              <button
                type="button"
                id="copy-vray-settings"
                onClick={() => copyToClipboard(JSON.stringify(config.vray, null, 2), 'vray-settings')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0 font-mono text-xs border border-white/10"
              >
                {copiedKey === 'vray-settings' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vray-settings' ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <h5 className="font-semibold text-cyan-400 mb-2 font-mono uppercase tracking-wider text-[11px]">VRayMtl Parâmetros</h5>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Fresnel IOR:</span>
                    <span className="text-gray-200 font-mono">{material.ior.toFixed(3)}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">BRDF Type:</span>
                    <span className="text-gray-200 font-mono">Microfacet GTR (GGX)</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Metalness:</span>
                    <span className="text-gray-200 font-mono">{material.metallic.toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-gray-400">Bump Slot Type:</span>
                    <span className="text-gray-200 font-mono">VRayNormalMap (Tangent Space)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <h5 className="font-semibold text-cyan-400 mb-2 font-mono uppercase tracking-wider text-[11px]">VRayDisplacementMod</h5>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Displacement Type:</span>
                    <span className="text-gray-200 font-mono">2D / 3D Mapping</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-gray-200 font-mono">{(material.displacementScale * 10).toFixed(2)} cm</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-gray-400">Shift (Center):</span>
                    <span className="text-gray-200 font-mono">{(-material.displacementScale * 5).toFixed(2)} cm</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
              <h5 className="font-semibold text-white mb-1.5 text-xs">Instruções de Conexão no V-Ray:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11px] leading-relaxed">
                {config.vray.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* RAW TXT DOC TAB */}
        {activeTab === 'raw_doc' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-mono">
                Arquivo: <code className="text-cyan-300">MATERIAL_CONFIG_BLENDER_VRAY_UNITY_UNREAL.txt</code>
              </span>
              <button
                type="button"
                id="copy-raw-doc"
                onClick={() => copyToClipboard(unifiedDoc, 'raw-doc')}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-md flex items-center gap-1.5 transition-all glow-cyan-sm text-xs uppercase font-mono tracking-wider"
              >
                {copiedKey === 'raw-doc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'raw-doc' ? 'Copiado!' : 'Copiar Arquivo TXT'}</span>
              </button>
            </div>
            <pre className="p-4 bg-black/90 border border-white/5 rounded-lg text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre leading-relaxed max-h-[380px]">
              {unifiedDoc}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
