"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Html } from "@react-three/drei";
import * as THREE from "three";

// --- HELPERS ---

const getThemeColor = (varName: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!val) return fallback;
  if (/^\d+\s+\d+\s+\d+$/.test(val))
    return `rgb(${val.split(/\s+/).join(", ")})`;
  if (val.startsWith("#") || val.startsWith("rgb") || val.startsWith("hsl"))
    return val;
  return val;
};

// Campus item SVG path data — minimal line-art silhouettes
const CAMPUS_ICONS: { id: string; path: string }[] = [
  {
    id: "laptop",
    path: "M2,14 L18,14 L18,3 L2,3 Z M0,15 L20,15 L20,16 Q10,18 0,16 Z",
  },
  {
    id: "book",
    path: "M3,2 L3,18 Q10,16 17,18 L17,2 Q10,4 3,2 Z M10,2 L10,18",
  },
  {
    id: "calculator",
    path: "M3,1 L17,1 L17,19 L3,19 Z M5,3 L15,3 L15,7 L5,7 Z M5,9 L8,9 M10,9 L13,9 M15,9 L15,9 M5,11 L8,11 M10,11 L13,11 M15,11 L15,11 M5,13 L8,13 M10,13 L13,13 M15,13 L15,13 M5,15 L8,15 M10,15 L13,17 L15,15",
  },
  {
    id: "bicycle",
    path: "M5,12 A4,4 0 1 0 5.001,12 M15,12 A4,4 0 1 0 15.001,12 M5,12 L10,5 L15,12 M10,5 L13,12 M7,8 L13,8",
  },
  {
    id: "backpack",
    path: "M6,4 Q10,2 14,4 L14,18 Q10,20 6,18 Z M8,4 Q10,6 12,4 M7,10 L13,10 L13,14 L7,14 Z",
  },
  {
    id: "camera",
    path: "M1,6 L5,6 L7,4 L13,4 L15,6 L19,6 L19,16 L1,16 Z M10,7 A4,4 0 1 0 10.001,7 M16,8 L17,8",
  },
  {
    id: "headphones",
    path: "M3,10 A7,7 0 0 1 17,10 M3,10 L3,14 Q3,16 5,16 L5,12 Q5,10 3,10 M17,10 L17,14 Q17,16 15,16 L15,12 Q15,10 17,10",
  },
  {
    id: "tablet",
    path: "M3,1 L17,1 L17,19 L3,19 Z M10,17 A1,1 0 1 0 10.001,17",
  },
  {
    id: "microscope",
    path: "M10,2 L10,12 M8,4 L12,4 M6,12 L14,12 M8,12 L7,16 L13,16 L12,12 M4,16 L16,16",
  },
  {
    id: "projector",
    path: "M1,6 L13,6 L13,14 L1,14 Z M13,9 L19,7 L19,13 L13,11 M4,9 L4,11 M7,9 L7,11",
  },
  {
    id: "notebook",
    path: "M4,1 L16,1 L16,19 L4,19 Z M4,5 L3,5 M4,9 L3,9 M4,13 L3,13 M7,5 L13,5 M7,8 L13,8 M7,11 L11,11",
  },
  {
    id: "flask",
    path: "M8,1 L8,8 L3,16 Q2,18 5,18 L15,18 Q18,18 17,16 L12,8 L12,1 M7,1 L13,1 M5,14 L15,14",
  },
];

// Category cluster definitions — ResourceX's six main categories
const CATEGORIES = [
  { label: "Study Materials", color: "primary", angle: 0 },
  { label: "Electronics", color: "primaryMuted", angle: 60 },
  { label: "Transportation", color: "success", angle: 120 },
  { label: "Living Essentials", color: "primary", angle: 180 },
  { label: "Creative Equipment", color: "primaryMuted", angle: 240 },
  { label: "Lab Resources", color: "success", angle: 300 },
];

// --- CLIENT COMPONENT SHELL ---

export default function BackgroundClient() {
  const [colors, setColors] = useState({
    primary: "#da7756",
    primaryMuted: "#f4c4ae",
    success: "#22c55e",
  });

  const [deviceSettings, setDeviceSettings] = useState({
    particleCount: 1200,
    connectionLimit: 220,
    iconCount: 12,
    isMobile: false,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // R3F measures its container on mount to size the canvas. When the canvas
  // mounts inside this `position: fixed` layer the measurement can run before
  // layout settles, leaving the WebGL buffer stuck at the default 300x150
  // (the background appears not to render). Nudge a re-measure once layout is
  // ready so the canvas fills the viewport.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const updateColors = () => {
      setColors({
        primary: getThemeColor("--color-primary", "#da7756"),
        primaryMuted: getThemeColor("--color-primaryMuted", "#f4c4ae"),
        success: getThemeColor("--color-success", "#22c55e"),
      });
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setDeviceSettings({
          particleCount: 400,
          connectionLimit: 60,
          iconCount: 5,
          isMobile: true,
        });
      } else if (w < 1024) {
        setDeviceSettings({
          particleCount: 800,
          connectionLimit: 120,
          iconCount: 8,
          isMobile: false,
        });
      } else {
        setDeviceSettings({
          particleCount: 1200,
          connectionLimit: 220,
          iconCount: 12,
          isMobile: false,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-transparent">
      <style>{`
        @keyframes campusDrift {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(35px, -50px) scale(1.12); }
          66% { transform: translate(-25px, 28px) scale(0.92); }
        }
        @keyframes campusWarm {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-45px, 42px) scale(1.18); }
        }
        @keyframes campusBreath {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.06; }
          50% { transform: translate(18px, -25px) scale(0.88); opacity: 0.03; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .campus-blob-1 { animation: campusDrift 32s ease-in-out infinite; }
        .campus-blob-2 { animation: campusWarm 38s ease-in-out infinite; }
        .campus-blob-3 { animation: campusBreath 24s ease-in-out infinite; }
        .campus-icon-float { animation: iconFloat 6s ease-in-out infinite; }
      `}</style>

      {/* Layer 1 — Campus Knowledge Atmosphere */}
      {!prefersReducedMotion ? (
        <div className="absolute inset-0 mix-blend-screen">
          {/* Warm knowledge glow — top left, like morning lecture light */}
          <div
            className="campus-blob-1 absolute rounded-full"
            style={{
              width: "72vw",
              height: "72vw",
              left: "-18vw",
              top: "-18vw",
              background: `radial-gradient(circle, ${colors.primary}22 0%, transparent 70%)`,
              filter: "blur(80px)",
            }}
          />
          {/* Community warmth — bottom right */}
          <div
            className="campus-blob-2 absolute rounded-full"
            style={{
              width: "60vw",
              height: "60vw",
              right: "-10vw",
              bottom: "-10vw",
              background: `radial-gradient(circle, ${colors.primaryMuted}18 0%, transparent 70%)`,
              filter: "blur(100px)",
            }}
          />
          {/* Collaboration pulse — center, very faint green for trust/success */}
          <div
            className="campus-blob-3 absolute rounded-full"
            style={{
              width: "40vw",
              height: "40vw",
              left: "30vw",
              top: "25vw",
              background: `radial-gradient(circle, ${colors.success}14 0%, transparent 70%)`,
              filter: "blur(90px)",
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, ${colors.primary} 0%, transparent 55%),
              radial-gradient(circle at 85% 85%, ${colors.primaryMuted} 0%, transparent 50%)
            `,
          }}
        />
      )}

      {/* Layer 4 — Wireframe Campus Structures (CSS, deep background) */}
      {!prefersReducedMotion && <CampusStructures colors={colors} />}

      {/* Three.js Canvas — Layers 2, 3, 5, 6, 7 */}
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, depth: false }}
        resize={{ offsetSize: true }}
        className="h-full w-full"
      >
        <AdaptiveDpr />
        <AdaptiveEvents />
        <CampusGlobe
          colors={colors}
          particleCount={deviceSettings.particleCount}
          connectionLimit={deviceSettings.connectionLimit}
          iconCount={deviceSettings.iconCount}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}

// --- LAYER 4: WIREFRAME CAMPUS STRUCTURES ---
// Pure CSS SVG — atmospheric outlines of campus buildings, very low opacity

function CampusStructures({
  colors,
}: {
  colors: { primary: string; primaryMuted: string; success: string };
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: 0.035 }}
    >
      {/* Library — large, upper left quadrant */}
      <svg
        viewBox="0 0 300 200"
        className="absolute"
        style={{
          left: "-5%",
          top: "5%",
          width: "40vw",
          maxWidth: 520,
          color: colors.primary,
          transform: "perspective(800px) rotateY(8deg)",
          filter: "blur(0.5px)",
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {/* Main library block */}
        <rect x="20" y="80" width="260" height="110" />
        {/* Roof / pediment */}
        <polyline points="10,80 150,30 290,80" />
        {/* Columns */}
        {[60, 100, 140, 180, 220].map((x) => (
          <line key={x} x1={x} y1="80" x2={x} y2="190" />
        ))}
        {/* Entrance steps */}
        <line x1="110" y1="190" x2="110" y2="200" />
        <line x1="190" y1="190" x2="190" y2="200" />
        <rect x="110" y="155" width="80" height="35" />
        {/* Windows */}
        <rect x="45" y="95" width="30" height="35" />
        <rect x="225" y="95" width="30" height="35" />
        {/* Frieze text lines (abstract) */}
        <line x1="50" y1="72" x2="250" y2="72" />
      </svg>

      {/* Dormitory tower — upper right */}
      <svg
        viewBox="0 0 120 300"
        className="absolute"
        style={{
          right: "8%",
          top: "-3%",
          width: "14vw",
          maxWidth: 180,
          color: colors.primaryMuted,
          filter: "blur(0.5px)",
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="10" y="60" width="100" height="230" />
        {/* Roof */}
        <polyline points="5,60 60,10 115,60" />
        {/* Window grid */}
        {[80, 110, 140, 170, 200, 230].map((y) =>
          [20, 50, 80].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="18" height="22" />
          )),
        )}
        {/* Entrance */}
        <rect x="42" y="245" width="36" height="45" />
      </svg>

      {/* Innovation lab — lower right, rotated slightly */}
      <svg
        viewBox="0 0 280 180"
        className="absolute"
        style={{
          right: "-8%",
          bottom: "8%",
          width: "35vw",
          maxWidth: 440,
          color: colors.success,
          transform: "perspective(800px) rotateY(-6deg)",
          filter: "blur(0.5px)",
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {/* Flat modern building */}
        <rect x="10" y="60" width="260" height="110" />
        {/* Glass curtain wall divisions */}
        {[50, 90, 130, 170, 210].map((x) => (
          <line key={x} x1={x} y1="60" x2={x} y2="170" />
        ))}
        <line x1="10" y1="100" x2="270" y2="100" />
        <line x1="10" y1="130" x2="270" y2="130" />
        {/* Flat roof overhang */}
        <line x1="0" y1="60" x2="280" y2="60" />
        <line x1="0" y1="55" x2="280" y2="55" />
        {/* Ground line */}
        <line x1="0" y1="170" x2="280" y2="170" />
        {/* Entrance canopy */}
        <line x1="110" y1="55" x2="110" y2="40" />
        <line x1="170" y1="55" x2="170" y2="40" />
        <line x1="105" y1="40" x2="175" y2="40" />
      </svg>

      {/* Study room — center left, very faint */}
      <svg
        viewBox="0 0 200 160"
        className="absolute"
        style={{
          left: "20%",
          bottom: "12%",
          width: "22vw",
          maxWidth: 280,
          color: colors.primary,
          filter: "blur(0.8px)",
          opacity: 0.6,
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="10" y="40" width="180" height="110" />
        {/* Roof peak */}
        <polyline points="5,40 100,8 195,40" />
        {/* Windows */}
        <rect x="25" y="58" width="45" height="38" />
        <rect x="130" y="58" width="45" height="38" />
        {/* Door */}
        <rect x="80" y="108" width="40" height="42" />
        {/* Chimney */}
        <rect x="130" y="14" width="12" height="28" />
      </svg>
    </div>
  );
}

// --- THREE.JS GLOBE COMPONENT ---

interface CampusGlobeProps {
  colors: { primary: string; primaryMuted: string; success: string };
  particleCount: number;
  connectionLimit: number;
  iconCount: number;
  prefersReducedMotion: boolean;
}

function CampusGlobe({
  colors,
  particleCount,
  connectionLimit,
  iconCount,
  prefersReducedMotion,
}: CampusGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsGeometryRef = useRef<THREE.BufferGeometry>(null);
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null);
  const clusterGeometryRef = useRef<THREE.BufferGeometry>(null);

  const timer = useMemo(() => {
    const t = new THREE.Timer();
    if (typeof document !== "undefined") {
      t.connect(document);
    }
    return t;
  }, []);

  useEffect(() => {
    return () => {
      timer.dispose();
    };
  }, [timer]);

  // Travelling transaction particles
  const transactionParticlesRef = useRef<THREE.Points>(null);
  const txGeoRef = useRef<THREE.BufferGeometry>(null);

  const parsedColors = useMemo(
    () => ({
      primary: new THREE.Color(colors.primary),
      primaryMuted: new THREE.Color(colors.primaryMuted),
      success: new THREE.Color(colors.success),
    }),
    [colors],
  );

  const R = 2.8; // Globe radius

  // ── Category cluster positions (Layer 6) ──────────────────────────────────
  const clusterData = useMemo(() => {
    const positions = new Float32Array(CATEGORIES.length * 3);
    const clusterColors = new Float32Array(CATEGORIES.length * 3);
    const clusterSizes = new Float32Array(CATEGORIES.length);
    const meta: { phase: number; speed: number; baseSize: number }[] = [];

    CATEGORIES.forEach((cat, i) => {
      const angleRad = (cat.angle * Math.PI) / 180;
      const phi = Math.acos(Math.random() * 0.8 - 0.4); // Spread across globe
      const r = R * 1.0;
      const x = r * Math.sin(phi) * Math.cos(angleRad);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(angleRad);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c =
        cat.color === "success"
          ? parsedColors.success
          : cat.color === "primaryMuted"
            ? parsedColors.primaryMuted
            : parsedColors.primary;

      clusterColors[i * 3] = c.r;
      clusterColors[i * 3 + 1] = c.g;
      clusterColors[i * 3 + 2] = c.b;

      clusterSizes[i] = 0.22 + Math.random() * 0.1;

      meta.push({
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        baseSize: 0.22 + Math.random() * 0.1,
      });
    });

    return { positions, clusterColors, clusterSizes, meta };
  }, [parsedColors]);

  // ── Icon positions on the globe surface ───────────────────────────────────
  const iconPositions = useMemo(() => {
    const temp = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < iconCount; i++) {
      const y = 1 - (i / (iconCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const r = R * 1.05; // Slightly off the sphere surface
      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;
      temp.push(new THREE.Vector3(x, y * r, z));
    }
    return temp;
  }, [iconCount]);

  // ── Base particle positions ───────────────────────────────────────────────
  const { basePositions, velocityScales, initialAttributes } = useMemo(() => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const tempPos = new Float32Array(particleCount * 3);
    const scales = [];
    const customColors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const shell = 0.85 + Math.random() * 0.3;

      tempPos[i * 3] = Math.cos(theta) * radiusAtY * shell * R;
      tempPos[i * 3 + 1] = y * shell * R;
      tempPos[i * 3 + 2] = Math.sin(theta) * radiusAtY * shell * R;

      scales.push({
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        speedX: 0.12 + Math.random() * 0.22,
        speedY: 0.12 + Math.random() * 0.22,
        speedZ: 0.12 + Math.random() * 0.22,
        amp: 0.03 + Math.random() * 0.05,
      });

      // Color distribution: 65% primary, 25% primaryMuted, 10% success
      const r = Math.random();
      const c =
        r > 0.9
          ? parsedColors.success
          : r > 0.65
            ? parsedColors.primaryMuted
            : parsedColors.primary;
      customColors[i * 3] = c.r;
      customColors[i * 3 + 1] = c.g;
      customColors[i * 3 + 2] = c.b;

      sizes[i] = 0.035 + Math.random() * 0.055;
    }

    return {
      basePositions: tempPos,
      velocityScales: scales,
      initialAttributes: { customColors, sizes },
    };
  }, [particleCount, parsedColors]);

  // ── Transaction particles (Layer 5) ──────────────────────────────────────
  const MAX_TX = 12;
  const txPositions = useMemo(() => new Float32Array(MAX_TX * 3), []);
  const txColors = useMemo(() => new Float32Array(MAX_TX * 3), []);
  const txSizes = useMemo(() => new Float32Array(MAX_TX), []);

  // Travel state for each transaction particle
  const txState = useMemo(() => {
    return Array.from({ length: MAX_TX }, () => ({
      active: false,
      t: 0,
      speed: 0.18 + Math.random() * 0.22,
      cooldown: 3 + Math.random() * 8,
      fromIdx: 0,
      toIdx: 0,
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      color: new THREE.Color(),
    }));
  }, []);

  // ── Connection lines buffers ──────────────────────────────────────────────
  const MAX_LINES = 500;
  const linePositions = useMemo(() => new Float32Array(MAX_LINES * 2 * 3), []);
  const lineColors = useMemo(() => new Float32Array(MAX_LINES * 2 * 4), []);

  // ── Mouse displacement ───────────────────────────────────────────────────
  const displacements = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount],
  );

  // ── Pulse state (Layer 7) ────────────────────────────────────────────────
  const pulse = useMemo(
    () => ({
      active: false,
      center: new THREE.Vector3(),
      radius: 0,
      maxRadius: 5.5,
      speed: 2.0,
      intensity: 0,
      cooldown: 8 + Math.random() * 8,
      // Which cluster triggered this pulse
      clusterIdx: 0,
    }),
    [],
  );

  // ── Shared materials ─────────────────────────────────────────────────────
  const pointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (240.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
        fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.08, dist);
        gl_FragColor = vec4(vColor, alpha * 0.82);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const linesMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
      attribute vec4 customColor;
      varying vec4 vColor;
      void main() {
        vColor = customColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // Cluster halo material — slightly brighter, larger points
  const clusterMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (320.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
        fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        // Softer halo falloff for cluster nodes
        float alpha = smoothstep(0.5, 0.0, dist) * 0.9;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // Transaction particle material — warm glowing dots
  const txMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (280.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
        fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(vColor, alpha * 0.95);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // ── Frame loop ───────────────────────────────────────────────────────────
  useFrame((state) => {
    timer.update();
    const time = timer.getElapsed();
    const delta = timer.getDelta();

    // Globe rotation
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.022;
      groupRef.current.rotation.x = Math.sin(time * 0.035) * 0.07;
    }

    // Mouse in local space
    const mouse3D = new THREE.Vector3(
      (state.pointer.x * state.viewport.width) / 2,
      (state.pointer.y * state.viewport.height) / 2,
      0,
    );
    const localMouse = mouse3D.clone();
    if (groupRef.current) groupRef.current.worldToLocal(localMouse);

    // ── Layer 7: Pulse events ──────────────────────────────────────────────
    if (!prefersReducedMotion) {
      if (pulse.active) {
        pulse.radius += delta * pulse.speed;
        pulse.intensity = Math.max(0, 1.0 - pulse.radius / pulse.maxRadius);
        if (pulse.radius >= pulse.maxRadius) {
          pulse.active = false;
          pulse.cooldown = 14 + Math.random() * 14;
        }
      } else {
        pulse.cooldown -= delta;
        if (pulse.cooldown <= 0) {
          pulse.active = true;
          pulse.radius = 0;
          pulse.intensity = 1.0;
          // Spawn from a random category cluster — "booking approved" event
          pulse.clusterIdx = Math.floor(Math.random() * CATEGORIES.length);
          const cIdx = pulse.clusterIdx * 3;
          pulse.center.set(
            clusterData.positions[cIdx],
            clusterData.positions[cIdx + 1],
            clusterData.positions[cIdx + 2],
          );
        }
      }
    }

    // ── Layer 2: Main particle update ──────────────────────────────────────
    const pointsGeo = pointsGeometryRef.current;
    if (pointsGeo) {
      const posAttr = pointsGeo.attributes.position.array as Float32Array;
      const sizeAttr = pointsGeo.attributes.size.array as Float32Array;
      const colorAttr = pointsGeo.attributes.customColor.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const origX = basePositions[idx];
        const origY = basePositions[idx + 1];
        const origZ = basePositions[idx + 2];

        let driftX = 0,
          driftY = 0,
          driftZ = 0;
        if (!prefersReducedMotion) {
          const vs = velocityScales[i];
          driftX = Math.sin(time * vs.speedX + vs.phaseX) * vs.amp;
          driftY = Math.sin(time * vs.speedY + vs.phaseY) * vs.amp;
          driftZ = Math.cos(time * vs.speedZ + vs.phaseZ) * vs.amp;
        }

        const px = origX + driftX;
        const py = origY + driftY;
        const pz = origZ + driftZ;

        // Mouse attraction
        let targetAttractX = 0,
          targetAttractY = 0,
          targetAttractZ = 0;
        if (!prefersReducedMotion) {
          const dx = localMouse.x - px;
          const dy = localMouse.y - py;
          const dz = localMouse.z - pz;
          const distToMouse = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distToMouse < 1.8) {
            const force = (1.8 - distToMouse) / 1.8;
            const strength = 0.22 * force;
            targetAttractX = dx * strength;
            targetAttractY = dy * strength;
            targetAttractZ = dz * strength;
          }
        }

        displacements[idx] += (targetAttractX - displacements[idx]) * 0.07;
        displacements[idx + 1] +=
          (targetAttractY - displacements[idx + 1]) * 0.07;
        displacements[idx + 2] +=
          (targetAttractZ - displacements[idx + 2]) * 0.07;

        const finalX = px + displacements[idx];
        const finalY = py + displacements[idx + 1];
        const finalZ = pz + displacements[idx + 2];

        posAttr[idx] = finalX;
        posAttr[idx + 1] = finalY;
        posAttr[idx + 2] = finalZ;

        let size = initialAttributes.sizes[i];
        let r = initialAttributes.customColors[idx];
        let g = initialAttributes.customColors[idx + 1];
        let b = initialAttributes.customColors[idx + 2];

        // Pulse wave colours
        if (pulse.active) {
          const distToPulse = Math.sqrt(
            (finalX - pulse.center.x) ** 2 +
              (finalY - pulse.center.y) ** 2 +
              (finalZ - pulse.center.z) ** 2,
          );
          const diff = Math.abs(distToPulse - pulse.radius);
          if (diff < 0.32) {
            const factor = ((0.32 - diff) / 0.32) * pulse.intensity;
            // Pulse colour: success green = booking confirmed
            size += factor * 0.14;
            r = r * (1 - factor * 0.7) + parsedColors.success.r * factor * 0.7;
            g = g * (1 - factor * 0.7) + parsedColors.success.g * factor * 0.7;
            b = b * (1 - factor * 0.7) + parsedColors.success.b * factor * 0.7;
          }
        }

        sizeAttr[i] = size;
        colorAttr[idx] = r;
        colorAttr[idx + 1] = g;
        colorAttr[idx + 2] = b;
      }

      pointsGeo.attributes.position.needsUpdate = true;
      pointsGeo.attributes.size.needsUpdate = true;
      pointsGeo.attributes.customColor.needsUpdate = true;
    }

    // ── Layer 3: Resource network connections ──────────────────────────────
    const linesGeo = linesGeometryRef.current;
    if (linesGeo && pointsGeo) {
      const posAttr = pointsGeo.attributes.position.array as Float32Array;
      const linePos = linesGeo.attributes.position.array as Float32Array;
      const lineCol = linesGeo.attributes.customColor.array as Float32Array;

      let activeLines = 0;
      const threshold = 0.72;
      const limit = Math.min(particleCount, connectionLimit);

      for (let i = 0; i < limit; i++) {
        if (activeLines >= MAX_LINES) break;
        const x1 = posAttr[i * 3];
        const y1 = posAttr[i * 3 + 1];
        const z1 = posAttr[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          if (activeLines >= MAX_LINES) break;
          const x2 = posAttr[j * 3];
          const y2 = posAttr[j * 3 + 1];
          const z2 = posAttr[j * 3 + 2];

          const dx = x1 - x2,
            dy = y1 - y2,
            dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < threshold) {
            const posIdx = activeLines * 6;
            linePos[posIdx] = x1;
            linePos[posIdx + 1] = y1;
            linePos[posIdx + 2] = z1;
            linePos[posIdx + 3] = x2;
            linePos[posIdx + 4] = y2;
            linePos[posIdx + 5] = z2;

            let alpha = (1.0 - dist / threshold) * 0.11;

            // Pulse along trust network lines
            if (pulse.active) {
              const midX = (x1 + x2) / 2,
                midY = (y1 + y2) / 2,
                midZ = (z1 + z2) / 2;
              const dtoPulse = Math.sqrt(
                (midX - pulse.center.x) ** 2 +
                  (midY - pulse.center.y) ** 2 +
                  (midZ - pulse.center.z) ** 2,
              );
              const diff = Math.abs(dtoPulse - pulse.radius);
              if (diff < 0.32) {
                alpha += ((0.32 - diff) / 0.32) * pulse.intensity * 0.28;
              }
            }

            const colIdx = activeLines * 8;
            const lc = parsedColors.primaryMuted;
            lineCol[colIdx] = lc.r;
            lineCol[colIdx + 1] = lc.g;
            lineCol[colIdx + 2] = lc.b;
            lineCol[colIdx + 3] = alpha;
            lineCol[colIdx + 4] = lc.r;
            lineCol[colIdx + 5] = lc.g;
            lineCol[colIdx + 6] = lc.b;
            lineCol[colIdx + 7] = alpha;

            activeLines++;
          }
        }
      }

      linesGeo.setDrawRange(0, activeLines * 2);
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.customColor.needsUpdate = true;
    }

    // ── Layer 6: Category cluster pulsing ──────────────────────────────────
    const clusterGeo = clusterGeometryRef.current;
    if (clusterGeo) {
      const sizeAttr = clusterGeo.attributes.size.array as Float32Array;
      clusterData.meta.forEach((m, i) => {
        const pulseFactor = prefersReducedMotion
          ? 0.5
          : Math.sin(time * m.speed + m.phase) * 0.5 + 0.5;
        // Extra boost if this cluster fired the most recent pulse
        const boostFactor =
          pulse.active && pulse.clusterIdx === i
            ? 1.0 + pulse.intensity * 0.8
            : 1.0;
        sizeAttr[i] = m.baseSize * (1.0 + pulseFactor * 0.7) * boostFactor;
      });
      clusterGeo.attributes.size.needsUpdate = true;
    }

    // ── Layer 5: Transaction particles ────────────────────────────────────
    if (!prefersReducedMotion && txGeoRef.current && pointsGeo) {
      const posAttr = pointsGeo.attributes.position.array as Float32Array;

      txState.forEach((tx, i) => {
        if (!tx.active) {
          tx.cooldown -= delta;
          if (tx.cooldown <= 0 && particleCount > 1) {
            // Pick two random particles as origin/dest — resource transfer
            tx.fromIdx = Math.floor(Math.random() * particleCount);
            tx.toIdx = Math.floor(Math.random() * particleCount);
            tx.from.set(
              posAttr[tx.fromIdx * 3],
              posAttr[tx.fromIdx * 3 + 1],
              posAttr[tx.fromIdx * 3 + 2],
            );
            tx.to.set(
              posAttr[tx.toIdx * 3],
              posAttr[tx.toIdx * 3 + 1],
              posAttr[tx.toIdx * 3 + 2],
            );
            // Occasionally use success colour = booking confirmed; mostly primary
            tx.color.copy(
              Math.random() > 0.6 ? parsedColors.success : parsedColors.primary,
            );
            tx.t = 0;
            tx.active = true;
            tx.speed = 0.16 + Math.random() * 0.18;
            tx.cooldown = 2 + Math.random() * 6;
          }
        } else {
          tx.t += delta * tx.speed;
          if (tx.t >= 1.0) {
            tx.active = false;
          }
        }

        // Compute position: arc along globe surface via slerp
        const t = tx.active ? Math.min(tx.t, 1.0) : -1;
        const pIdx = i * 3;
        if (tx.active && t >= 0) {
          // Simple lerp lifted slightly off surface (arc approximation)
          const lerpX = tx.from.x + (tx.to.x - tx.from.x) * t;
          const lerpY = tx.from.y + (tx.to.y - tx.from.y) * t;
          const lerpZ = tx.from.z + (tx.to.z - tx.from.z) * t;

          // Arc: push toward globe surface radius
          const len = Math.sqrt(lerpX * lerpX + lerpY * lerpY + lerpZ * lerpZ);
          const arcScale = len > 0 ? (R * 1.02) / len : 1;

          txPositions[pIdx] = lerpX * arcScale;
          txPositions[pIdx + 1] = lerpY * arcScale;
          txPositions[pIdx + 2] = lerpZ * arcScale;

          // Fade in/out envelope
          const envelope = Math.sin(t * Math.PI);
          txColors[pIdx] = tx.color.r;
          txColors[pIdx + 1] = tx.color.g;
          txColors[pIdx + 2] = tx.color.b;
          txSizes[i] = 0.12 * envelope;
        } else {
          // Invisible when inactive
          txPositions[pIdx] = 0;
          txPositions[pIdx + 1] = 0;
          txPositions[pIdx + 2] = 0;
          txSizes[i] = 0;
        }
      });

      const txGeo = txGeoRef.current;
      (txGeo.attributes.position.array as Float32Array).set(txPositions);
      (txGeo.attributes.customColor.array as Float32Array).set(txColors);
      (txGeo.attributes.size.array as Float32Array).set(txSizes);
      txGeo.attributes.position.needsUpdate = true;
      txGeo.attributes.customColor.needsUpdate = true;
      txGeo.attributes.size.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Layer 2 — Campus Resource Particles */}
      <points key={`pts-${particleCount}`}>
        <bufferGeometry ref={pointsGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[basePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[initialAttributes.sizes, 1]}
          />
          <bufferAttribute
            attach="attributes-customColor"
            args={[initialAttributes.customColors, 3]}
          />
        </bufferGeometry>
        <primitive object={pointsMaterial} attach="material" />
      </points>

      {/* Layer 3 — Resource Network Lines */}
      <lineSegments key={`lines-${particleCount}`}>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-customColor"
            args={[lineColors, 4]}
          />
        </bufferGeometry>
        <primitive object={linesMaterial} attach="material" />
      </lineSegments>

      {/* Layer 5 — Transaction Particles */}
      <points ref={transactionParticlesRef}>
        <bufferGeometry ref={txGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[txPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-customColor"
            args={[txColors, 3]}
          />
          <bufferAttribute attach="attributes-size" args={[txSizes, 1]} />
        </bufferGeometry>
        <primitive object={txMaterial} attach="material" />
      </points>

      {/* Layer 6 — Category Cluster Nodes */}
      <points>
        <bufferGeometry ref={clusterGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[clusterData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[clusterData.clusterSizes, 1]}
          />
          <bufferAttribute
            attach="attributes-customColor"
            args={[clusterData.clusterColors, 3]}
          />
        </bufferGeometry>
        <primitive object={clusterMaterial} attach="material" />
      </points>

      {/* Layer 8 — Floating Campus Icons */}
      {iconPositions.map((pos, i) => {
        const icon = CAMPUS_ICONS[i % CAMPUS_ICONS.length];
        return (
          <Html
            key={icon.id}
            position={pos}
            center
            distanceFactor={8}
            className="pointer-events-none select-none"
          >
            <div
              className={`${
                prefersReducedMotion ? "" : "campus-icon-float"
              } flex items-center justify-center p-2 rounded-xl bg-surface/75 border border-border/80 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 hover:scale-110`}
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      animationDelay: `${i * 0.45}s`,
                      animationDuration: `${5.5 + (i % 3)}s`,
                    }
              }
            >
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={icon.path} />
              </svg>
            </div>
          </Html>
        );
      })}
    </group>
  );
}
