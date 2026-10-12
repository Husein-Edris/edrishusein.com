// Three.js hero background: a dot-grid terrain that recedes to the horizon,
// gently swelling like a topographic map. Loaded only via dynamic import from
// HeroScene.tsx, so none of this code is in the first-paint bundle.
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

export interface HeroSceneOptions {
  reducedMotion: boolean;
  compact: boolean; // small screens: fewer points, cheaper per frame
}

export interface HeroSceneHandle {
  dispose: () => void;
}

// Brand colors from src/styles/variables.scss ($color-beige, $white, $primary-color)
const COLOR_BEIGE = '#b2a59b';
const COLOR_WHITE = '#ffffff';

const MAX_PIXEL_RATIO = 2;
const GRID_FULL = { cols: 168, rows: 84 };
const GRID_COMPACT = { cols: 84, rows: 52 };
const FIELD_WIDTH = 44;
const FIELD_NEAR_Z = 6;
const FIELD_FAR_Z = -34;
const POINTER_EASE = 0.06;
const STILL_FRAME_TIME = 7.5; // a pleasant phase for the reduced-motion still

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vec3 p = position;
    float t = uTime;
    float h = sin(p.x * 0.28 + t * 0.45) * 0.38
            + sin(p.z * 0.42 - t * 0.32) * 0.26
            + sin((p.x + p.z) * 0.17 + t * 0.21 + uScroll * 2.0) * 0.52;
    float d = distance(p.xz, uPointer);
    h += exp(-d * d * 0.06) * 1.1 * uPointerStrength;
    p.y += h;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    vDepth = -mv.z;
    vHeight = h;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uOpacity;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.2, r);
    float far = 1.0 - smoothstep(14.0, 38.0, vDepth);
    float near = smoothstep(2.0, 7.0, vDepth);
    float lift = clamp(vHeight * 0.7 + 0.35, 0.0, 1.0);
    vec3 color = mix(uColorLow, uColorHigh, lift * 0.55);
    gl_FragColor = vec4(color, edge * far * near * (0.35 + lift * 0.65) * uOpacity);
  }
`;

function supportsWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

function buildGrid(cols: number, rows: number): Float32Array {
  const positions = new Float32Array(cols * rows * 3);
  let i = 0;
  for (let r = 0; r < rows; r += 1) {
    const z = FIELD_NEAR_Z + (FIELD_FAR_Z - FIELD_NEAR_Z) * (r / (rows - 1));
    for (let c = 0; c < cols; c += 1) {
      positions[i] = (c / (cols - 1) - 0.5) * FIELD_WIDTH;
      positions[i + 1] = 0;
      positions[i + 2] = z;
      i += 3;
    }
  }
  return positions;
}

export function createHeroScene(
  container: HTMLElement,
  { reducedMotion, compact }: HeroSceneOptions,
): HeroSceneHandle | null {
  if (!supportsWebGL()) return null;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'hero-scene__canvas';
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 80);
  camera.position.set(0, 3.4, 10);
  camera.lookAt(0, 0.6, -6);

  const grid = compact ? GRID_COMPACT : GRID_FULL;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(buildGrid(grid.cols, grid.rows), 3));

  const uniforms = {
    uTime: { value: reducedMotion ? STILL_FRAME_TIME : 0 },
    uScroll: { value: 0 },
    uPointer: { value: [0, -4] as [number, number] },
    uPointerStrength: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: compact ? 26 : 30 },
    uOpacity: { value: 1 },
    uColorLow: { value: new Color(COLOR_BEIGE) },
    uColorHigh: { value: new Color(COLOR_WHITE) },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  scene.add(points);

  const render = () => renderer.render(scene, camera);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // Reduced motion: one still frame, no loop, no listeners beyond resize.
  if (reducedMotion) {
    render();
    return {
      dispose: () => {
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      },
    };
  }

  const pointerTarget = { x: 0, z: -4, strength: 0 };
  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height;
    pointerTarget.x = nx * 22;
    pointerTarget.z = 4 - ny * 16;
    pointerTarget.strength = ny >= 0 && ny <= 1 ? 1 : 0;
  };
  const onPointerLeave = () => {
    pointerTarget.strength = 0;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);

  let inView = true;
  let pageVisible = document.visibilityState !== 'hidden';
  let frameId = 0;
  let lastTime = performance.now();
  let elapsed = 0;

  const tick = (now: number) => {
    frameId = 0;
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    elapsed += delta;

    const pointer = uniforms.uPointer.value;
    pointer[0] += (pointerTarget.x - pointer[0]) * POINTER_EASE;
    pointer[1] += (pointerTarget.z - pointer[1]) * POINTER_EASE;
    uniforms.uPointerStrength.value +=
      (pointerTarget.strength - uniforms.uPointerStrength.value) * POINTER_EASE;
    uniforms.uTime.value = elapsed;
    uniforms.uScroll.value = Math.min(window.scrollY / Math.max(container.clientHeight, 1), 1.5);

    render();
    schedule();
  };

  const schedule = () => {
    if (frameId || !inView || !pageVisible) return;
    lastTime = performance.now();
    frameId = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  };

  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) schedule();
    else stop();
  });
  intersection.observe(container);

  const onVisibility = () => {
    pageVisible = document.visibilityState !== 'hidden';
    if (pageVisible) schedule();
    else stop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  schedule();

  return {
    dispose: () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
