import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite';

let detector = null;
let initPromise = null;

/**
 * Initialises the singleton ObjectDetector. Subsequent calls return the cached instance.
 * @returns {Promise<ObjectDetector>}
 */
export async function initPhoneDetector() {
  if (detector) return detector;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(CDN);

    detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'CPU',
      },
      categoryAllowlist: ['cell phone'],
      scoreThreshold: 0.4,
      maxResults: 1,
      runningMode: 'VIDEO',
    });

    return detector;
  })();

  return initPromise;
}

/**
 * Releases the detector and resets the singleton so it can be re-initialised.
 */
export function destroyPhoneDetector() {
  if (detector) {
    detector.close();
    detector = null;
    initPromise = null;
  }
}

/**
 * Runs one detection frame on the given video element.
 * @param {HTMLVideoElement} video
 * @param {number} timestamp - Monotonically increasing timestamp in ms (use performance.now()).
 * @returns {{ phoneDetected: boolean, confidence: number, boundingBox: object|null }}
 */
export function detectPhone(video, timestamp) {
  const noPhone = { phoneDetected: false, confidence: 0, boundingBox: null };
  if (!detector || !video) return noPhone;

  try {
    const results = detector.detectForVideo(video, timestamp);
    const best = results?.detections?.[0];
    if (!best) return noPhone;
    return {
      phoneDetected: true,
      confidence: best.categories[0]?.score || 0,
      boundingBox: best.boundingBox,
    };
  } catch {
    return noPhone;
  }
}

/**
 * Creates a stateful manager that fires alert events with hold-time and cooldown debouncing.
 * @param {{ triggerAfterMs?: number, cooldownMs?: number }} options
 * @returns {{ update: (detection: object) => boolean, reset: () => void }}
 */
export function createAlertManager({ triggerAfterMs = 1500, cooldownMs = 8000 } = {}) {
  let detectionStartTime = null;
  let lastAlertTime = 0;
  let isActive = false;

  return {
    update(detection) {
      const now = Date.now();
      if (detection.phoneDetected) {
        if (!detectionStartTime) detectionStartTime = now;
        const elapsed = now - detectionStartTime;
        const cooldownOk = now - lastAlertTime > cooldownMs;
        if (elapsed >= triggerAfterMs && cooldownOk && !isActive) {
          isActive = true;
          lastAlertTime = now;
          return true;
        }
      } else {
        detectionStartTime = null;
        isActive = false;
      }
      return false;
    },
    reset() {
      detectionStartTime = null;
      lastAlertTime = 0;
      isActive = false;
    },
  };
}
