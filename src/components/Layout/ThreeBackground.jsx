import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

function createParticleSprite(THREE) {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.06,
    size * 0.5,
    size * 0.5,
    size * 0.5
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.58, 'rgba(255,255,255,0.28)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createFlowData(count, spreadX, spreadY, depthScale) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  const amplitude = new Float32Array(count);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellX = spreadX / cols;
  const cellY = spreadY / rows;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (Math.random() - 0.5) * cellX * 0.62;
    const jitterY = (Math.random() - 0.5) * cellY * 0.62;
    const nx = (col + 0.5) / cols - 0.5;
    const ny = (row + 0.5) / rows - 0.5;
    const swirl = Math.sin((nx * 4.2 + ny * 3.7) * Math.PI);

    const x = nx * spreadX + jitterX;
    const y = ny * spreadY + jitterY + swirl * 1.15;
    const z = swirl * depthScale * 3.2 + (Math.random() - 0.5) * 5.2;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.25 + Math.random() * 0.45;
    amplitude[i] = 0.35 + Math.random() * 0.95;
  }

  return { positions, basePositions, phase, speed, amplitude };
}

export default function ThreeBackground() {
  const canvasRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let isDisposed = false;
    let frameId;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (isDisposed) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 120);
      camera.position.z = 21;

      const baseCount = window.innerWidth < 768 ? 300 : 560;
      const accentCount = window.innerWidth < 768 ? 210 : 420;
      const baseFlow = createFlowData(baseCount, 52, 30, 0.45);
      const accentFlow = createFlowData(accentCount, 48, 27, 0.35);
      const sprite = createParticleSprite(THREE);

      const baseGeometry = new THREE.BufferGeometry();
      baseGeometry.setAttribute('position', new THREE.BufferAttribute(baseFlow.positions, 3));
      const accentGeometry = new THREE.BufferGeometry();
      accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentFlow.positions, 3));

      const baseMaterial = new THREE.PointsMaterial({
        color: 0xb7caff,
        size: 0.42,
        transparent: true,
        opacity: 0.42,
        map: sprite,
        alphaMap: sprite,
        alphaTest: 0.02,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const accentMaterial = new THREE.PointsMaterial({
        color: 0x86f2de,
        size: 0.3,
        transparent: true,
        opacity: 0.28,
        map: sprite,
        alphaMap: sprite,
        alphaTest: 0.02,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(baseGeometry, baseMaterial);
      const accents = new THREE.Points(accentGeometry, accentMaterial);
      scene.add(particles);
      scene.add(accents);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(10.8, 0.08, 22, 220),
        new THREE.MeshBasicMaterial({
          color: 0x89ecd9,
          transparent: true,
          opacity: 0.16,
        })
      );
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(7.3, 0.065, 20, 180),
        new THREE.MeshBasicMaterial({
          color: 0x9cb9ff,
          transparent: true,
          opacity: 0.14,
        })
      );
      ring.rotation.x = Math.PI / 2.7;
      ring.rotation.y = Math.PI / 8.8;
      ring.position.y = -0.5;
      ring2.rotation.x = Math.PI / 2.35;
      ring2.rotation.y = -Math.PI / 7.5;
      ring2.position.y = 0.4;
      scene.add(ring);
      scene.add(ring2);

      const clock = new THREE.Clock();

      const animate = () => {
        const elapsed = clock.getElapsedTime();

        for (let i = 0; i < baseCount; i += 1) {
          const i3 = i * 3;
          const wobble = Math.sin(elapsed * baseFlow.speed[i] + baseFlow.phase[i]);
          const drift = Math.cos(elapsed * (baseFlow.speed[i] * 0.7) + baseFlow.phase[i] * 0.6);
          baseFlow.positions[i3] = baseFlow.basePositions[i3] + wobble * baseFlow.amplitude[i] * 0.8;
          baseFlow.positions[i3 + 1] = baseFlow.basePositions[i3 + 1] + drift * baseFlow.amplitude[i] * 0.9;
          baseFlow.positions[i3 + 2] = baseFlow.basePositions[i3 + 2] + wobble * baseFlow.amplitude[i] * 0.35;
        }

        for (let i = 0; i < accentCount; i += 1) {
          const i3 = i * 3;
          const wobble = Math.sin(elapsed * (accentFlow.speed[i] + 0.15) + accentFlow.phase[i]);
          const drift = Math.cos(elapsed * (accentFlow.speed[i] * 0.8) + accentFlow.phase[i] * 0.8);
          accentFlow.positions[i3] = accentFlow.basePositions[i3] + wobble * accentFlow.amplitude[i] * 1.15;
          accentFlow.positions[i3 + 1] = accentFlow.basePositions[i3 + 1] + drift * accentFlow.amplitude[i] * 1.05;
          accentFlow.positions[i3 + 2] = accentFlow.basePositions[i3 + 2] + drift * accentFlow.amplitude[i] * 0.45;
        }

        baseGeometry.attributes.position.needsUpdate = true;
        accentGeometry.attributes.position.needsUpdate = true;
        particles.rotation.y = elapsed * 0.008;
        accents.rotation.y = -elapsed * 0.01;
        ring.rotation.z = elapsed * 0.055;
        ring.position.y = -0.5 + Math.sin(elapsed * 0.4) * 0.55;
        ring2.rotation.z = -elapsed * 0.045;
        ring2.position.y = 0.4 + Math.cos(elapsed * 0.36) * 0.45;
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      if (shouldReduceMotion) {
        renderer.render(scene, camera);
      } else {
        animate();
      }

      const handleResize = () => {
        const { innerWidth, innerHeight } = window;
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(innerWidth, innerHeight, false);
        if (shouldReduceMotion) renderer.render(scene, camera);
      };

      window.addEventListener('resize', handleResize);

      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (frameId) window.cancelAnimationFrame(frameId);
        sprite.dispose();
        baseGeometry.dispose();
        baseMaterial.dispose();
        accentGeometry.dispose();
        accentMaterial.dispose();
        ring.geometry.dispose();
        ring.material.dispose();
        ring2.geometry.dispose();
        ring2.material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      isDisposed = true;
      cleanup();
    };
  }, [shouldReduceMotion]);

  return <canvas ref={canvasRef} className="bg-three-canvas" aria-hidden="true" />;
}
