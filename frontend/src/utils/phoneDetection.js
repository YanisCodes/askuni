import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let detector = null;
let initPromise = null;

export async function initPhoneDetector() {
  if (detector) return detector;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Explicitly using version 0.10.32 to match package.json
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
    );

    detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
        // CPU delegate is safer across all browsers than GPU
        delegate: 'CPU',
      },
      categoryAllowlist: ['cell phone'],
      scoreThreshold: 0.3,
      maxResults: 3,
      runningMode: 'VIDEO',
    });

    return detector;
  })();

  return initPromise;
}

export function destroyPhoneDetector() {
  if (detector) {
    detector.close();
    detector = null;
    initPromise = null;
  }
}

/**
 * Run object detection on the current video frame.
 */
export function detectPhone(video, timestamp) {
  const noPhone = {
    phoneDetected: false,
    message: '',
    confidence: 0,
    boundingBox: null
  };

  if (!detector || !video) {
    return noPhone;
  }

  try {
    const results = detector.detectForVideo(video, timestamp);

    if (results && results.detections && results.detections.length > 0) {
      // Find the highest confidence cell phone detection
      const bestDetection = results.detections.sort((a, b) =>
        (b.categories[0]?.score || 0) - (a.categories[0]?.score || 0)
      )[0];

      const score = bestDetection.categories[0]?.score || 0;

      return {
        phoneDetected: true,
        message: 'Phone detected!',
        confidence: score,
        boundingBox: bestDetection.boundingBox
      };
    }
  } catch (error) {
    console.error("Detection error:", error);
  }

  return noPhone;
}

/**
 * Creates an alert manager that prevents alert spam.
 */
export function createAlertManager({ triggerAfterMs = 1500, cooldownMs = 8000 } = {}) {
  let detectionStartTime = null;
  let lastAlertTime = 0;
  let isActive = false;

  return {
    update(detection) {
      const now = Date.now();

      if (detection.phoneDetected) {
        if (!detectionStartTime) {
          detectionStartTime = now;
        }

        const elapsed = now - detectionStartTime;
        const cooldownOk = now - lastAlertTime > cooldownMs;

        if (elapsed >= triggerAfterMs && cooldownOk && !isActive) {
          isActive = true;
          lastAlertTime = now;
          return true; // Fire alert
        }
      } else {
        // Reset when phone is no longer detected
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
