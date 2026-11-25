import * as THREE from 'three';
import { ZONES } from './syria.js';

const PALETTE = ['#2e7d4f', '#f5c542', '#ffffff', '#d3322e', '#4cc9f0', '#ff9f1c'];
const BURST_COUNT = 5;
const SPARKS_PER_BURST = 22;

function createFlagBanner(color) {
  const geo = new THREE.PlaneGeometry(2.6, 1.5, 6, 3);
  const mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.raycast = () => {};
  return mesh;
}

export function createSyriaCelebration(zonePositions = {}) {
  const root = new THREE.Group();
  root.name = 'syria-victory-celebration';
  root.visible = true;

  const zoneFestivals = [];

  ZONES.forEach((z, zIdx) => {
    const pos = zonePositions[z.id] || [0, 0, 0];
    const topY = z.model?.top || 28;
    const g = new THREE.Group();
    g.position.set(pos[0], pos[1] || 0, pos[2] || 0);
    root.add(g);

    const ringGeo = new THREE.RingGeometry(14, 15.2, 32).rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#f5c542',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.25;
    ring.raycast = () => {};
    g.add(ring);

    const flags = [];
    for (let f = 0; f < 4; f++) {
      const ang = (f / 4) * Math.PI * 2 + Math.PI / 4;
      const fx = Math.cos(ang) * 16;
      const fz = Math.sin(ang) * 16;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 8.5, 8),
        new THREE.MeshBasicMaterial({ color: '#e5e7eb' })
      );
      pole.position.set(fx, 4.25, fz);
      pole.raycast = () => {};
      g.add(pole);

      const flagGroup = new THREE.Group();
      flagGroup.position.set(fx + 1.3, 7.6, fz);
      const colors = ['#2e7d4f', '#ffffff', '#1f2326'];
      colors.forEach((c, idx) => {
        const stripe = createFlagBanner(c);
        stripe.scale.set(1, 0.34, 1);
        stripe.position.y = (1 - idx) * 0.5;
        flagGroup.add(stripe);
      });
      g.add(flagGroup);
      flags.push({ group: flagGroup, phase: f * 1.1 + zIdx });
    }

    const bursts = [];
    for (let b = 0; b < BURST_COUNT; b++) {
      const angle = (b / BURST_COUNT) * Math.PI * 2 + zIdx * 0.4;
      const spreadR = 7 + (b % 3) * 4.5;
      const bx = Math.cos(angle) * spreadR;
      const bz = Math.sin(angle) * spreadR;
      const apexY = topY + 14 + (b % 3) * 7;

      const rocket = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 1 })
      );
      rocket.raycast = () => {};
      g.add(rocket);

      const sparks = [];
      const burstColor = PALETTE[(zIdx + b) % PALETTE.length];
      const sparkGeo = new THREE.SphereGeometry(0.42, 6, 6);

      for (let s = 0; s < SPARKS_PER_BURST; s++) {
        const theta = (s / SPARKS_PER_BURST) * Math.PI * 2;
        const phi = ((s * 7) % SPARKS_PER_BURST) / SPARKS_PER_BURST * Math.PI;
        const dir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        ).normalize();

        const colHex = s % 4 === 0 ? '#f5c542' : burstColor;
        const sparkMat = new THREE.MeshBasicMaterial({
          color: colHex,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.raycast = () => {};
        g.add(spark);
        sparks.push({ mesh: spark, mat: sparkMat, dir });
      }

      bursts.push({
        bx,
        bz,
        apexY,
        rocket,
        sparks,
        period: 3.4 + (b % 3) * 0.55,
        offset: b * 0.72 + zIdx * 0.35,
      });
    }

    zoneFestivals.push({ id: z.id, group: g, flags, bursts, ringMat });
  });

  function update(elapsedSeconds = 0) {
    if (!root.visible) return;

    for (const zf of zoneFestivals) {
      zf.ringMat.opacity = 0.32 + 0.18 * Math.sin(elapsedSeconds * 3.0);
      for (const fl of zf.flags) {
        fl.group.rotation.y = Math.sin(elapsedSeconds * 3.5 + fl.phase) * 0.18;
      }

      for (const br of zf.bursts) {
        const localT = ((elapsedSeconds + br.offset) % br.period) / br.period;

        if (localT < 0.45) {
          const u = localT / 0.45;
          br.rocket.visible = true;
          br.rocket.position.set(br.bx, 4 + u * (br.apexY - 4), br.bz);
          br.rocket.material.opacity = 1 - u * 0.25;
          for (const sp of br.sparks) sp.mesh.visible = false;
        } else {
          br.rocket.visible = false;
          const e = (localT - 0.45) / 0.55;
          const radius = Math.pow(e, 0.65) * 11.5;
          const gravityDrop = e * e * 4.5;
          const fade = Math.max(0, 1 - e);

          for (const sp of br.sparks) {
            sp.mesh.visible = fade > 0.02;
            sp.mesh.position.set(
              br.bx + sp.dir.x * radius,
              br.apexY + sp.dir.y * radius - gravityDrop,
              br.bz + sp.dir.z * radius
            );
            const sc = Math.max(0.15, fade * 1.25);
            sp.mesh.scale.setScalar(sc);
            sp.mat.opacity = fade;
          }
        }
      }
    }
  }

  function setEnabled(enabled) {
    root.visible = Boolean(enabled);
  }

  function toggle() {
    root.visible = !root.visible;
    return root.visible;
  }

  function isEnabled() {
    return root.visible;
  }

  function dispose() {
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  return {
    object3D: root,
    update,
    setEnabled,
    toggle,
    isEnabled,
    dispose,
  };
}
