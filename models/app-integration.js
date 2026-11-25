import * as THREE from 'three';
import { ZONES } from './syria.js';
import { createSyriaCelebration } from './syria-celebration.js';
import { createCityLayerManager } from './landmark-manager.js';

export function initSyriaCityIntegration({ scene, renderer, camera }) {
  if (!scene || !renderer) {
    throw new Error('initSyriaCityIntegration requires scene and renderer.');
  }

  // تحسين الأداء والبصرية على الهواتف والأجهزة المختلفة
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const celebration = createSyriaCelebration(window.ZONE_POSITIONS || {});
  scene.add(celebration.object3D);

  const cityManager = createCityLayerManager({ scene, celebration });

  // تسجيل كل معلم متاح في المشهد أو في ZONES ليُزال ويُعاد لوحده
  for (const z of ZONES) {
    const grp = window.LANDMARK_GROUPS?.[z.id] || scene.getObjectByName(z.id);
    if (grp) {
      cityManager.registerLandmark(z.id, z.model?.label || z.place || z.id, grp, true);
    }
  }

  // ربط أزرار التحكم بلوحة الإدارة فقط
  const adminPanel =
    document.getElementById('admin-panel') ||
    document.querySelector('[data-role="admin-panel"]');

  if (adminPanel) {
    cityManager.mountAdminControls(adminPanel);
  }

  const clock = new THREE.Clock();

  function update() {
    celebration.update(clock.getElapsedTime());
  }

  function renderFrame() {
    update();
    if (camera) {
      renderer.render(scene, camera);
    }
  }

  return {
    celebration,
    cityManager,
    update,
    renderFrame,
  };
}
