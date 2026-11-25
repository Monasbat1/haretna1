export function createCityLayerManager({ scene, celebration }) {
  const landmarks = new Map();

  function registerLandmark(id, label, object3D, enabled = true) {
    if (!id || !object3D) return;
    object3D.visible = Boolean(enabled);
    landmarks.set(id, { id, label: label || id, object3D, enabled: Boolean(enabled) });
    if (!object3D.parent && scene) {
      scene.add(object3D);
    }
  }

  function setLandmarkEnabled(id, enabled) {
    const item = landmarks.get(id);
    if (!item) return false;
    item.enabled = Boolean(enabled);
    item.object3D.visible = item.enabled;
    return true;
  }

  function toggleLandmark(id) {
    const item = landmarks.get(id);
    if (!item) return null;
    item.enabled = !item.enabled;
    item.object3D.visible = item.enabled;
    return item.enabled;
  }

  function removeLandmark(id) {
    return setLandmarkEnabled(id, false);
  }

  function restoreLandmark(id) {
    return setLandmarkEnabled(id, true);
  }

  function setCelebrationEnabled(enabled) {
    if (!celebration) return false;
    celebration.setEnabled(Boolean(enabled));
    return true;
  }

  function toggleCelebration() {
    if (!celebration) return null;
    return celebration.toggle();
  }

  function listLandmarks() {
    return Array.from(landmarks.values()).map(({ id, label, enabled }) => ({
      id,
      label,
      enabled,
    }));
  }

  function mountAdminControls(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;direction:rtl;font-family:Tajawal,system-ui,sans-serif;';

    const celebBtn = document.createElement('button');
    const syncCelebText = () => {
      const active = celebration?.isEnabled?.() ?? true;
      celebBtn.textContent = active
        ? '🎆 إزالة حفلة نصر سوريا والألعاب النارية'
        : '🎉 إعادة حفلة نصر سوريا والألعاب النارية';
    };
    syncCelebText();
    celebBtn.onclick = () => {
      toggleCelebration();
      syncCelebText();
    };
    wrap.appendChild(celebBtn);

    for (const item of listLandmarks()) {
      const btn = document.createElement('button');
      const syncText = () => {
        btn.textContent = item.enabled
          ? `🏛️ إزالة معلم: ${item.label}`
          : `➕ إعادة معلم: ${item.label}`;
      };
      syncText();
      btn.onclick = () => {
        toggleLandmark(item.id);
        syncText();
      };
      wrap.appendChild(btn);
    }

    containerEl.appendChild(wrap);
  }

  return {
    registerLandmark,
    setLandmarkEnabled,
    toggleLandmark,
    removeLandmark,
    restoreLandmark,
    setCelebrationEnabled,
    toggleCelebration,
    listLandmarks,
    mountAdminControls,
  };
}
