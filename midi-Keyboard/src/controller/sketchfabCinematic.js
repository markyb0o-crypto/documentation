/**
 * Cinematische Szene für den Sketchfab-Viewer: Licht, Post-FX, Kamera-Slides.
 */

/**
 * @param {object} api Sketchfab Viewer API
 */
export function applyCinematicScene(api) {
  api.setBackground({ color: [0.039, 0.047, 0.063] });

  api.setPostProcessing({
    enable: true,
    vignetteEnable: true,
    vignetteAmount: 0.48,
    vignetteHardness: 0.28,
    bloomEnable: true,
    bloomIntensity: 0.22,
    bloomThreshold: 0.88,
    bloomRadius: 0.38,
    ssaoEnable: true,
    ssaoIntensity: 0.5,
    ssaoRadius: 10,
    sharpenEnable: true,
    sharpenFactor: 0.14,
    grainEnable: true,
    grainIntensity: 0.06,
  });

  api.getEnvironment((err, env) => {
    if (err || !env) return;
    api.setEnvironment({
      ...env,
      enabled: true,
      exposure: 1.2,
      lightIntensity: 1.35,
      shadowEnabled: true,
    });
  });
}

/**
 * @param {[number, number, number]} target
 * @param {number} radius
 * @param {number} height
 * @param {number} count
 */
function buildOrbitShots(target, radius, height, count = 6) {
  const shots = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const lift = height + Math.sin(i * 1.3) * 0.08;
    shots.push({
      position: [
        target[0] + Math.cos(angle) * radius,
        lift,
        target[2] + Math.sin(angle) * radius,
      ],
      target: [target[0], target[1] + 0.02, target[2]],
      duration: 3.2 + (i % 3) * 0.4,
    });
  }
  return shots;
}

/**
 * @param {object} api
 * @param {{ current: boolean }} pauseRef
 */
export function startCameraSlides(api, pauseRef) {
  api.setCameraEasing('easeInOutCubic');
  api.setEnableCameraConstraints(false, { preventCameraConstraintsFocus: false });

  let shots = [];
  let shotIndex = 0;
  let timeoutId = null;
  let active = true;

  const schedule = (delay, fn) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };

  const playNext = () => {
    if (!active || !shots.length) return;

    if (pauseRef.current) {
      schedule(600, playNext);
      return;
    }

    const shot = shots[shotIndex];
    api.setCameraLookAt(shot.position, shot.target, shot.duration);
    api.setCameraLookAtEndAnimationCallback(() => {
      shotIndex = (shotIndex + 1) % shots.length;
      schedule(900, playNext);
    });
  };

  api.focusOnVisibleGeometries(2.2, () => {
    api.getCameraLookAt((err, camera) => {
      if (err || !camera) {
        shots = buildOrbitShots([0, 0.05, 0], 1.1, 0.45);
        schedule(800, playNext);
        return;
      }

      const { position, target } = camera;
      const dx = position[0] - target[0];
      const dz = position[2] - target[2];
      const radius = Math.max(0.7, Math.hypot(dx, dz) * 0.92);

      shots = [
        ...buildOrbitShots(target, radius, position[1], 5),
        {
          position: [target[0], position[1] * 1.15, target[2] + radius * 0.3],
          target,
          duration: 3.8,
        },
        {
          position: [target[0] + radius * 0.35, position[1] * 0.75, target[2] + radius * 0.85],
          target: [target[0], target[1] + 0.04, target[2]],
          duration: 3.4,
        },
      ];

      schedule(1000, playNext);
    });
  });

  return () => {
    active = false;
    clearTimeout(timeoutId);
  };
}

/**
 * @param {object} api
 * @param {string} meshId
 */
export function focusControlShot(api) {
  api.getCameraLookAt((err, camera) => {
    if (err || !camera) return;

    const { target } = camera;
    api.setCameraLookAt(
      [target[0] + 0.35, target[1] + 0.28, target[2] + 0.55],
      target,
      1.4,
    );
  });
}
