import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

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
      camera.position.z = 20;

      const particleCount = window.innerWidth < 768 ? 380 : 760;
      const positions = new Float32Array(particleCount * 3);
      const accentPositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 52;
        positions[i3 + 1] = (Math.random() - 0.5) * 32;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
        accentPositions[i3] = (Math.random() - 0.5) * 50;
        accentPositions[i3 + 1] = (Math.random() - 0.5) * 30;
        accentPositions[i3 + 2] = (Math.random() - 0.5) * 22;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const accentGeometry = new THREE.BufferGeometry();
      accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xb7caff,
        size: 0.18,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const accentMaterial = new THREE.PointsMaterial({
        color: 0x86f2de,
        size: 0.11,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      const accents = new THREE.Points(accentGeometry, accentMaterial);
      scene.add(particles);
      scene.add(accents);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(11.2, 0.09, 20, 220),
        new THREE.MeshBasicMaterial({
          color: 0x7ce7d4,
          transparent: true,
          opacity: 0.18,
        })
      );
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(7.8, 0.07, 18, 180),
        new THREE.MeshBasicMaterial({
          color: 0x95b4ff,
          transparent: true,
          opacity: 0.16,
        })
      );
      ring.rotation.x = Math.PI / 2.8;
      ring.rotation.y = Math.PI / 9;
      ring2.rotation.x = Math.PI / 2.4;
      ring2.rotation.y = -Math.PI / 8;
      scene.add(ring);
      scene.add(ring2);

      const clock = new THREE.Clock();

      const animate = () => {
        const elapsed = clock.getElapsedTime();
        particles.rotation.y = elapsed * 0.026;
        particles.rotation.x = Math.sin(elapsed * 0.24) * 0.06;
        accents.rotation.y = -elapsed * 0.018;
        accents.rotation.x = Math.cos(elapsed * 0.18) * 0.05;
        ring.rotation.z = elapsed * 0.065;
        ring.position.y = Math.sin(elapsed * 0.5) * 0.75;
        ring2.rotation.z = -elapsed * 0.05;
        ring2.position.y = Math.cos(elapsed * 0.42) * 0.65;
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
        particleGeometry.dispose();
        particleMaterial.dispose();
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
