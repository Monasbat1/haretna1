import * as THREE from 'three';
import { ZONES } from './models/syria.js';
import { createSyriaCelebration } from './models/syria-celebration.js';
import { createCityLayerManager } from './models/landmark-manager.js';

function getSceneObjects() {
  const scene =
    window.__CITY_SCENE__ ||
    window.scene ||
    window.__SCENE__ ||
    null;

  const renderer =
    window.__CITY_RENDERER__ ||
    window.renderer ||
    window.__RENDERER__ ||
    null;

  const camera =
    window.__CITY_CAMERA__ ||
    window.camera ||
    window.__CAMERA__ ||
    null;

  if (scene && renderer) {
    return { scene, renderer, camera };
  }

  // البحث التلقائي داخل كائنات window إن كان city.js يخزن المشهد باسم آخر
  for (const key of Object.keys(window)) {
    const val = window[key];
    if (!val || typeof val !== 'object') continue;
    if (!renderer && typeof val.render === 'function' && val.domElement) {
      window.__CITY_RENDERER__ = val;
    }
    if (!scene && val.isScene) {
      window.__CITY_SCENE__ = val;
    }
    if (!camera && val.isCamera) {
      window.__CITY_CAMERA__ = val;
    }
  }

  return {
    scene: window.__CITY_SCENE__ || window.scene || null,
    renderer: window.__CITY_RENDERER__ || window.renderer || null,
    camera: window.__CITY_CAMERA__ || window.camera || null,
  };
}

function buildSyriaLandmarks(scene) {
  const landmarkGroups = {};
  const zonePositions = {};

  // توزيع معالم سوريا في منطقة واضحة ومرتبة على الخريطة دون تداخل
  const baseX = -180;
  const baseZ = -180;
  const stepX = 95;
  const stepZ = 95;

  ZONES.forEach((z, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const px = baseX + col * stepX;
    const pz = baseZ + row * stepZ;

    zonePositions[z.id] = [px, 0, pz];

    let grp =
      window.LANDMARK_GROUPS?.[z.id] ||
      scene.getObjectByName(z.id) ||
      null;

    if (!grp) {
      grp = new THREE.Group();
      grp.name = z.id;
      grp.position.set(px, 0, pz);

      if (typeof z.model === 'function') {
        try {
          z.model(grp);
        } catch (err) {
          console.warn('Landmark build error:', z.id, err);
        }
      }

      scene.add(grp);
    }

    landmarkGroups[z.id] = grp;
  });

  window.LANDMARK_GROUPS = Object.assign({}, window.LANDMARK_GROUPS || {}, landmarkGroups);
  window.ZONE_POSITIONS = Object.assign({}, window.ZONE_POSITIONS || {}, zonePositions);

  return { landmarkGroups, zonePositions };
}

function readAdminFlags() {
  const cfg = window.__CITY_CONFIG__ || window.CFG || {};
  const meta = window.__CITY_META__ || {};
  const celebrationOff = Boolean(
    cfg.celebrationOff ?? meta.celebrationOff ?? false
  );
  const lmOff = Boolean(
    cfg.lmOff ?? meta.lmOff ?? false
  );
  const hiddenList = Array.isArray(cfg.hiddenLandmarks)
    ? cfg.hiddenLandmarks
    : Array.isArray(meta.hiddenLandmarks)
      ? meta.hiddenLandmarks
      : [];

  return {
    celebrationOff,
    lmOff,
    hiddenSet: new Set(hiddenList),
  };
}

export function startSyriaBridge() {
  if (window.__SYRIA_BRIDGE_STARTED__) {
    return window.__SYRIA_BRIDGE_STARTED__;
  }

  const { scene, renderer, camera } = getSceneObjects();
  if (!scene || !renderer) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const { landmarkGroups, zonePositions } = buildSyriaLandmarks(scene);
  const celebration = createSyriaCelebration(zonePositions);
  scene.add(celebration.object3D);

  const cityManager = createCityLayerManager({ scene, celebration });

  for (const z of ZONES) {
    const grp = landmarkGroups[z.id];
    if (grp) {
      cityManager.registerLandmark(
        z.id,
        z.model?.label || z.place || z.id,
        grp,
        true
      );
    }
  }

  const adminPanel =
    document.getElementById('admin-panel') ||
    document.querySelector('[data-role="admin-panel"]');
  if (adminPanel) {
    cityManager.mountAdminControls(adminPanel);
  }

  function applyRemoteState() {
    const { celebrationOff, lmOff, hiddenSet } = readAdminFlags();
    cityManager.setCelebrationEnabled(!celebrationOff);

    for (const z of ZONES) {
      const visible = !lmOff && !hiddenSet.has(z.id);
      cityManager.setLandmarkEnabled(z.id, visible);
    }
  }

  applyRemoteState();

  const clock = new THREE.Clock();
  let lastStateSync = 0;

  function update() {
    const elapsed = clock.getElapsedTime();
    if (elapsed - lastStateSync > 1.0) {
      lastStateSync = elapsed;
      applyRemoteState();
    }
    celebration.update(elapsed);
  }

  const api = {
    scene,
    renderer,
    camera,
    celebration,
    cityManager,
    landmarkGroups,
    applyRemoteState,
    update,
  };

  window.__SYRIA_BRIDGE_STARTED__ = api;
  window.__SYRIA_INTEGRATION__ = api;

  function loop() {
    update();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return api;
}
