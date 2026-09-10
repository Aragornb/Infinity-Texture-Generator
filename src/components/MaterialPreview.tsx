import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MaterialProperties, PBRMapData } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Box,
  Camera,
  Circle,
  Cylinder,
  Download,
  Eye,
  Layers,
  Lightbulb,
  Maximize2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Square,
  Waves,
} from 'lucide-react';

interface MaterialPreviewProps {
  maps: PBRMapData | null;
  material: MaterialProperties;
  isProcessing: boolean;
}

type PreviewMeshType = 'sphere' | 'cube' | 'cylinder' | 'plane' | 'cloth';
type LightingPreset = 'studio' | 'raking' | 'warm' | 'contrast';

// Helper function to generate realistic cloth draped over a sphere with strict non-penetrating physical collision
function createDrapedClothOverSphereGeometry(): THREE.BufferGeometry {
  const segments = 160;
  const size = 2.9;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  const pos = geo.attributes.position;
  const index = geo.index;

  // Invert triangle index winding order so generated vertex normals point strictly OUTWARD (away from sphere)
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      index.setX(i, b);
      index.setX(i + 1, a);
    }
  }

  // Inner obstacle sphere radius is 0.92 in Three.js scene
  // Cloth barrier radius is 0.965 => guaranteed non-penetrating safety clearance of at least 0.045 units
  const innerSphereRadius = 0.92;
  const clothBarrierRadius = 0.965;
  const halfSize = size / 2; // 1.45

  // Detachment latitude ~ 47 degrees (0.82 rad) where cloth starts fluting into outward pleats
  const phiDetach = 0.82;
  const sDetach = clothBarrierRadius * phiDetach;

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i); // in [-1.45, 1.45]
    const v = pos.getY(i); // in [-1.45, 1.45]

    const s = Math.sqrt(u * u + v * v);
    const theta = Math.atan2(v, u);

    const cosT = Math.abs(Math.cos(theta));
    const sinT = Math.abs(Math.sin(theta));
    const sMax = halfSize / Math.max(cosT, sinT, 0.0001);

    let xVal: number;
    let yVal: number;
    let zVal: number;

    if (s <= sDetach) {
      // Zone 1: Smooth spherical cap over the top dome
      // Cloth wraps geodesically over the sphere dome without stretching
      const phi = (s / sDetach) * phiDetach;
      xVal = clothBarrierRadius * Math.sin(phi) * Math.cos(theta);
      zVal = clothBarrierRadius * Math.sin(phi) * Math.sin(theta);
      yVal = clothBarrierRadius * Math.cos(phi);
    } else {
      // Zone 2: Draped fabric with outward fluting, gravity catenary drop, and strict collision clearance
      const deltaS = s - sDetach;
      const t = Math.min(1.0, Math.max(0.0, deltaS / Math.max(0.001, sMax - sDetach)));

      // 4 corners hang further down and have larger outward fluting
      const cornerFactor = (sMax - halfSize) / Math.max(0.001, halfSize * (Math.SQRT2 - 1)); // 0 to 1

      // Latitude progresses past equator smoothly
      const phi = phiDetach + (Math.PI * 0.53 - phiDetach) * Math.pow(t, 0.82);

      // Base sphere coordinate at this latitude
      const rBaseSphere = clothBarrierRadius * Math.sin(phi);
      const yBaseSphere = clothBarrierRadius * Math.cos(phi);

      // Downward gravity drop: smooth acceleration downwards once approaching and clearing equator
      const gravityDrop = 0.76 * Math.pow(t, 1.35) + 0.38 * cornerFactor * Math.pow(t, 1.15);
      yVal = yBaseSphere - gravityDrop;

      // Calculate horizontal radius of the obstacle sphere at this specific yVal
      let rObstacle = 0;
      if (yVal > -clothBarrierRadius && yVal < clothBarrierRadius) {
        rObstacle = Math.sqrt(Math.max(0, clothBarrierRadius * clothBarrierRadius - yVal * yVal));
      }

      // Base clearance from sphere: flares outward as fabric gathers excess circumference
      const baseFlare = 0.02 + 0.14 * Math.pow(t, 1.2) + 0.12 * cornerFactor * t;

      // Outward pleats & drapery waves: strictly positive wave (>= 0) so folds buckle away from sphere
      // 8 primary flutes aligned with corners + edges, plus harmonic micro-creases
      const fluteWave =
        Math.pow(Math.cos(4 * theta), 2) * 0.16 +
        Math.pow(Math.sin(6 * theta + 0.25), 2) * 0.07 +
        Math.pow(Math.cos(8 * theta), 2) * 0.04;

      const waveEnvelope = Math.pow(t, 1.3) * (1.0 + 0.45 * cornerFactor);
      const outwardDisplacement = fluteWave * waveEnvelope;

      // Effective horizontal radius
      const rCandidate = Math.max(rBaseSphere, rObstacle) + baseFlare + outwardDisplacement;

      xVal = rCandidate * Math.cos(theta);
      zVal = rCandidate * Math.sin(theta);

      // Subtle vertical ripple along the pleat peaks
      const yRipple = Math.cos(8 * theta) * 0.03 * Math.pow(t, 1.5);
      yVal += yRipple;
    }

    // STRICT UNILATERAL PHYSICAL BARRIER CONSTRAINTS:
    // 1. Guaranteed radial clearance from sphere center (0, 0, 0)
    const dist3D = Math.sqrt(xVal * xVal + yVal * yVal + zVal * zVal);
    if (dist3D < clothBarrierRadius) {
      const push = clothBarrierRadius / Math.max(0.0001, dist3D);
      xVal *= push;
      yVal *= push;
      zVal *= push;
    }

    // 2. Strict horizontal clearance from sphere profile at height yVal
    if (yVal > -clothBarrierRadius && yVal < clothBarrierRadius) {
      const rMinAtY = Math.sqrt(clothBarrierRadius * clothBarrierRadius - yVal * yVal) + 0.02;
      const rHoriz = Math.sqrt(xVal * xVal + zVal * zVal);
      if (rHoriz < rMinAtY) {
        const rPush = rMinAtY / Math.max(0.0001, rHoriz);
        xVal *= rPush;
        zVal *= rPush;
      }
    }

    pos.setX(i, xVal);
    pos.setY(i, yVal);
    pos.setZ(i, zVal);
  }

  geo.computeVertexNormals();
  return geo;
}

export const MaterialPreview: React.FC<MaterialPreviewProps> = ({
  maps,
  material,
  isProcessing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances ref
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    innerSphere?: THREE.Mesh;
    material: THREE.MeshPhysicalMaterial;
    lights: {
      ambient: THREE.AmbientLight;
      main: THREE.DirectionalLight;
      fill: THREE.DirectionalLight;
      rim: THREE.DirectionalLight;
    };
    loadedTextures: {
      albedo?: THREE.Texture;
      normal?: THREE.Texture;
      roughness?: THREE.Texture;
      metallic?: THREE.Texture;
      displacement?: THREE.Texture;
      ao?: THREE.Texture;
    };
  } | null>(null);

  // Preview options
  const [meshType, setMeshType] = useState<PreviewMeshType>('sphere');
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [enableDisplacement, setEnableDisplacement] = useState<boolean>(true);
  const [tiling, setTiling] = useState<number>(material.seamlessTiling || 1);

  const { t } = useLanguage();

  // Sync internal tiling state if material.seamlessTiling changes from controls
  useEffect(() => {
    if (material.seamlessTiling !== undefined) {
      setTiling(material.seamlessTiling);
    }
  }, [material.seamlessTiling]);

  // Drag interaction state (only renders on drag, no continuous animation loop)
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // On-demand render trigger
  const renderScene = useCallback(() => {
    if (!threeRef.current) return;
    const { renderer, scene, camera } = threeRef.current;
    renderer.render(scene, camera);
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const main = new THREE.DirectionalLight(0xffffff, 1.8);
    main.position.set(3, 4, 3);
    scene.add(main);

    const fill = new THREE.DirectionalLight(0xcceeff, 0.7);
    fill.position.set(-3, 0, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x00e5ff, 0.8);
    rim.position.set(0, -3, -2);
    scene.add(rim);

    // Physical PBR Material with Transmission (Transparency), IOR (Refraction) and Emission
    const pbrMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: material.baseRoughness,
      metalness: material.metallic,
      ior: material.ior || 1.5,
      transmission: material.transparency ?? 0,
      transparent: (material.transparency ?? 0) > 0,
      opacity: Math.max(0.12, 1.0 - (material.transparency ?? 0) * 0.45),
      emissive: new THREE.Color(material.emissiveColor || 0xffffff),
      emissiveIntensity: material.emissiveIntensity ?? 0,
      side: THREE.DoubleSide,
    });

    // Default Sphere Geometry
    const geometry = new THREE.SphereGeometry(1.25, 96, 96);
    if (!geometry.attributes.uv2) {
      geometry.setAttribute('uv2', geometry.getAttribute('uv'));
    }
    const mesh = new THREE.Mesh(geometry, pbrMat);
    mesh.rotation.y = -Math.PI / 4;
    scene.add(mesh);

    // Inner sphere displayed underneath the draped cloth geometry
    const innerSphereGeo = new THREE.SphereGeometry(0.92, 64, 64);
    const innerSphereMat = new THREE.MeshStandardMaterial({
      color: 0x161922,
      roughness: 0.28,
      metalness: 0.85,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    innerSphere.visible = false;
    innerSphere.rotation.y = -Math.PI / 4;
    scene.add(innerSphere);

    threeRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      innerSphere,
      material: pbrMat,
      lights: { ambient, main, fill, rim },
      loadedTextures: {},
    };

    renderScene();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && threeRef.current) {
          threeRef.current.camera.aspect = w / h;
          threeRef.current.camera.updateProjectionMatrix();
          threeRef.current.renderer.setSize(w, h);
          threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      innerSphereGeo.dispose();
      innerSphereMat.dispose();
      pbrMat.dispose();
    };
  }, []);

  // Automatically switch to cloth preview when user picks a fabric preset
  useEffect(() => {
    if (material.category === 'Tecidos') {
      setMeshType('cloth');
    }
  }, [material.category]);

  // Apply geometry change
  useEffect(() => {
    if (!threeRef.current) return;
    const { mesh, innerSphere } = threeRef.current;

    let newGeo: THREE.BufferGeometry;
    switch (meshType) {
      case 'cube':
        newGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8, 64, 64, 64);
        break;
      case 'cylinder':
        newGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.0, 64, 64);
        break;
      case 'plane':
        newGeo = new THREE.PlaneGeometry(2.5, 2.5, 96, 96);
        break;
      case 'cloth': {
        // Draped cloth over a sphere geometry
        newGeo = createDrapedClothOverSphereGeometry();
        break;
      }
      case 'sphere':
      default:
        newGeo = new THREE.SphereGeometry(1.25, 96, 96);
        break;
    }

    if (!newGeo.attributes.uv2) {
      newGeo.setAttribute('uv2', newGeo.getAttribute('uv'));
    }

    mesh.geometry.dispose();
    mesh.geometry = newGeo;

    // Show inner sphere only when viewing cloth draped over sphere
    if (innerSphere) {
      innerSphere.visible = meshType === 'cloth';
    }

    // When viewing cloth, tilt slightly downward to showcase the spherical dome and draped folds
    if (meshType === 'cloth') {
      mesh.rotation.set(0.28, -Math.PI / 4, 0);
      if (innerSphere) {
        innerSphere.rotation.set(0.28, -Math.PI / 4, 0);
      }
    } else {
      mesh.rotation.set(0, -Math.PI / 4, 0);
      if (innerSphere) {
        innerSphere.rotation.set(0, -Math.PI / 4, 0);
      }
    }

    renderScene();
  }, [meshType, renderScene]);

  // Apply lighting preset change
  useEffect(() => {
    if (!threeRef.current) return;
    const { lights } = threeRef.current;

    switch (lighting) {
      case 'raking':
        // Grazing angled light to maximize normal and displacement depth
        lights.ambient.intensity = 0.25;
        lights.ambient.color.setHex(0xffffff);
        lights.main.position.set(4, 0.5, 1);
        lights.main.intensity = 2.4;
        lights.main.color.setHex(0xfff5ea);
        lights.fill.position.set(-3, 0.5, 1);
        lights.fill.intensity = 0.4;
        lights.fill.color.setHex(0x99bbdd);
        lights.rim.intensity = 0.5;
        break;

      case 'warm':
        // Warm sunset mood
        lights.ambient.intensity = 0.5;
        lights.ambient.color.setHex(0xffeedd);
        lights.main.position.set(2.5, 3.5, 3);
        lights.main.intensity = 2.0;
        lights.main.color.setHex(0xffaa55);
        lights.fill.position.set(-3, 1, 2);
        lights.fill.intensity = 0.8;
        lights.fill.color.setHex(0x5588cc);
        lights.rim.intensity = 1.0;
        lights.rim.color.setHex(0xff7733);
        break;

      case 'contrast':
        // Crisp high-contrast spotlight for metallic & specular
        lights.ambient.intensity = 0.35;
        lights.ambient.color.setHex(0xffffff);
        lights.main.position.set(3, 4, 3.5);
        lights.main.intensity = 2.8;
        lights.main.color.setHex(0xffffff);
        lights.fill.position.set(-3, -1, 1);
        lights.fill.intensity = 0.4;
        lights.fill.color.setHex(0xaaccff);
        lights.rim.intensity = 1.2;
        lights.rim.color.setHex(0x00f0ff);
        break;

      case 'studio':
      default:
        // Balanced 3-point studio lighting
        lights.ambient.intensity = 0.65;
        lights.ambient.color.setHex(0xffffff);
        lights.main.position.set(3, 4, 3);
        lights.main.intensity = 1.8;
        lights.main.color.setHex(0xffffff);
        lights.fill.position.set(-3, 0, 2);
        lights.fill.intensity = 0.7;
        lights.fill.color.setHex(0xcceeff);
        lights.rim.intensity = 0.8;
        lights.rim.color.setHex(0x00e5ff);
        break;
    }

    renderScene();
  }, [lighting, renderScene]);

  // Update textures whenever `maps` or `material` changes (after recalculation)
  useEffect(() => {
    if (!threeRef.current || !maps) return;

    const { material: pbrMat, loadedTextures } = threeRef.current;
    const loader = new THREE.TextureLoader();

    // Helper to configure texture wrapping and tiling
    const setupTexture = (tex: THREE.Texture, isColor = false) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(tiling, tiling);
      if (isColor) {
        tex.colorSpace = THREE.SRGBColorSpace;
      }
      tex.needsUpdate = true;
    };

    let pendingLoads = 0;
    const checkAllLoaded = () => {
      pendingLoads--;
      if (pendingLoads <= 0) {
        renderScene();
      }
    };

    // Dispose old textures
    Object.values(loadedTextures).forEach((t) => {
      if (t instanceof THREE.Texture) {
        t.dispose();
      }
    });

    // Sync physical properties immediately
    pbrMat.roughness = material.baseRoughness;
    pbrMat.metalness = material.metallic;
    pbrMat.ior = material.ior || 1.5;
    pbrMat.reflectivity = material.specularLevel !== undefined ? material.specularLevel : 0.5;
    (pbrMat as any).specularIntensity = material.specularLevel !== undefined ? material.specularLevel : 0.5;
    pbrMat.transmission = material.transparency ?? 0;
    pbrMat.transparent = (material.transparency ?? 0) > 0;
    pbrMat.opacity = Math.max(0.12, 1.0 - (material.transparency ?? 0) * 0.45);
    pbrMat.emissive.set(material.emissiveColor || 0xffffff);
    pbrMat.emissiveIntensity = material.emissiveIntensity ?? 0;
    pbrMat.side = THREE.DoubleSide;

    // 1. Albedo / Diffuse Map
    const diffuseSource = maps.diffuse || (maps as any).albedo;
    if (diffuseSource) {
      pendingLoads++;
      loader.load(diffuseSource, (tex) => {
        setupTexture(tex, true);
        pbrMat.map = tex;
        pbrMat.color.set(0xffffff); // Pure white base to show diffuse texture without color tinting
        loadedTextures.albedo = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // 2. Normal Map
    if (maps.normal) {
      pendingLoads++;
      loader.load(maps.normal, (tex) => {
        setupTexture(tex, false);
        pbrMat.normalMap = tex;
        const flipY = material.normalFormat === 'DirectX' ? -1 : 1;
        pbrMat.normalScale.set(
          material.normalStrength,
          material.normalStrength * flipY
        );
        loadedTextures.normal = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // 3. Roughness Map
    if (maps.roughness) {
      pendingLoads++;
      loader.load(maps.roughness, (tex) => {
        setupTexture(tex, false);
        pbrMat.roughnessMap = tex;
        pbrMat.roughness = material.baseRoughness;
        loadedTextures.roughness = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // 4. Specular / Metallic
    if (maps.specular) {
      pendingLoads++;
      loader.load(maps.specular, (tex) => {
        setupTexture(tex, false);
        pbrMat.metalnessMap = tex;
        pbrMat.metalness = material.metallic;
        loadedTextures.metallic = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // 5. Displacement / Height Map
    if (maps.displacement) {
      pendingLoads++;
      loader.load(maps.displacement, (tex) => {
        setupTexture(tex, false);
        pbrMat.displacementMap = tex;
        pbrMat.displacementScale = enableDisplacement
          ? material.displacementScale * (meshType === 'cloth' ? 1.0 : 2.0)
          : 0;
        pbrMat.displacementBias = 0;
        loadedTextures.displacement = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // 6. Ambient Occlusion Map
    if (maps.ao) {
      pendingLoads++;
      loader.load(maps.ao, (tex) => {
        setupTexture(tex, false);
        pbrMat.aoMap = tex;
        pbrMat.aoMapIntensity = material.aoIntensity;
        loadedTextures.ao = tex;
        pbrMat.needsUpdate = true;
        checkAllLoaded();
      });
    }

    // If no textures to load, render immediately
    if (pendingLoads === 0) {
      pbrMat.needsUpdate = true;
      renderScene();
    }
  }, [maps, material, enableDisplacement, tiling, renderScene]);

  // Mouse & Touch Drag interaction to rotate preview (on-demand render during move only)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !threeRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    const { mesh, innerSphere } = threeRef.current;
    mesh.rotation.y += deltaX * 0.012;
    mesh.rotation.x += deltaY * 0.012;
    if (innerSphere) {
      innerSphere.rotation.y = mesh.rotation.y;
      innerSphere.rotation.x = mesh.rotation.x;
    }

    // Render this single frame during manual rotation
    renderScene();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already released
    }
  };

  const handleResetRotation = () => {
    if (!threeRef.current) return;
    const initialRotX = meshType === 'cloth' ? 0.28 : 0;
    threeRef.current.mesh.rotation.set(initialRotX, -Math.PI / 4, 0);
    if (threeRef.current.innerSphere) {
      threeRef.current.innerSphere.rotation.set(initialRotX, -Math.PI / 4, 0);
    }
    renderScene();
  };

  // Export high-res preview snapshot as PNG
  const handleDownloadSnapshot = () => {
    if (!canvasRef.current) return;
    renderScene();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${material.name.toLowerCase().replace(/\s+/g, '_')}_pbr_preview.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full glass rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
      {/* Header bar */}
      <div className="p-3.5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {t('previewTitle')}
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {t('previewBadge')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              {t('previewDesc')}
            </p>
          </div>
        </div>

        {/* Snapshot & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-preview-reset-rot"
            onClick={handleResetRotation}
            title={t('resetAngle')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">{t('resetAngle')}</span>
          </button>

          <button
            type="button"
            id="btn-preview-snapshot"
            onClick={handleDownloadSnapshot}
            title={t('snapshotHd')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-white/10 transition-all text-xs font-mono flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-bold">{t('snapshotHd')}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-radial from-[#131620] via-[#090b10] to-[#040507] overflow-hidden select-none cursor-grab active:cursor-grabbing">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* WebGL Canvas */}
        <div ref={containerRef} className="w-full h-full">
          <canvas
            ref={canvasRef}
            id="canvas-material-preview-3d"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block touch-none"
          />
        </div>

        {/* Recalculating Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20 pointer-events-none">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-cyan-200 tracking-wide">
              {t('recalculatingOverlay')}
            </span>
          </div>
        )}

        {/* Orbit Hint Badge */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>{t('orbitHint')}</span>
        </div>

        {/* Material Specs Floating Badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 flex flex-col items-end gap-1 font-mono text-[9px]">
          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 font-semibold">
            {material.name}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-white/5">
            Normal: {material.normalStrength.toFixed(1)}x ({material.normalFormat})
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-white/5">
            Displacement: {enableDisplacement ? `${material.displacementScale.toFixed(3)}m` : 'Off'}
          </span>
          {(material.transparency ?? 0) > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {t('transparency')}: {Math.round((material.transparency ?? 0) * 100)}% (IOR: {(material.ior ?? 1.5).toFixed(2)})
            </span>
          )}
          {(material.emissiveIntensity ?? 0) > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-yellow-950/80 text-yellow-300 border border-yellow-500/30">
              {t('emissive')}: {(material.emissiveIntensity ?? 0).toFixed(2)}x
            </span>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar: Geometry, Lighting, Displacement & Tiling */}
      <div className="p-3 border-t border-white/5 bg-[#07080d] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Geometry Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-[10px] uppercase tracking-wider mr-1">{t('geomLabel')}</span>
          {(
            [
              { id: 'sphere', label: t('geomSphere'), icon: Circle },
              { id: 'cube', label: t('geomCube'), icon: Box },
              { id: 'cylinder', label: t('geomCylinder'), icon: Cylinder },
              { id: 'plane', label: t('geomPlane'), icon: Square },
              { id: 'cloth', label: t('geomCloth'), icon: Waves },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = meshType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`btn-geom-${item.id}`}
                onClick={() => setMeshType(item.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-cyan-500 text-black font-bold shadow-xs'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lighting & Displacement Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lighting Presets */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <span className="text-gray-500 text-[9px] uppercase px-1">{t('lightLabel')}</span>
            {(
              [
                { id: 'studio', label: t('lightStudio') },
                { id: 'raking', label: t('lightRaking') },
                { id: 'warm', label: t('lightWarm') },
                { id: 'contrast', label: t('lightContrast') },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                id={`btn-light-${l.id}`}
                onClick={() => setLighting(l.id)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  lighting === l.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Displacement Toggle */}
          <button
            type="button"
            id="btn-toggle-displacement"
            onClick={() => setEnableDisplacement((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md border text-[10px] transition-all flex items-center gap-1.5 ${
              enableDisplacement
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Displacement {enableDisplacement ? 'ON' : 'OFF'}</span>
          </button>

          {/* Tiling repeat */}
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/5 text-[10px]">
            <span className="text-gray-500">{t('tilingLabel')}</span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTiling(n)}
                className={`px-1.5 py-0.2 rounded font-bold ${
                  tiling === n ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
