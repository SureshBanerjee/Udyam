/**
 * pose/mediapipe.js
 * Loads and wraps the MediaPipe Tasks Vision Pose Landmarker.
 *
 * Uses the MediaPipe CDN WASM bundle — no server upload of frames.
 * All inference runs entirely client-side in the browser.
 */

let poseLandmarker = null;
let isLoading      = false;
let loadError      = null;

/**
 * Wait for window.MediaPipeTasksVision to be populated by the CDN import.
 * Retries every 200ms for up to 20 seconds.
 */
async function waitForMediaPipe(timeoutMs = 20000) {
  const start = Date.now();
  while (!window.MediaPipeTasksVision) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('MediaPipe Tasks Vision failed to load. Check network connection.');
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return window.MediaPipeTasksVision;
}

export async function loadPoseLandmarker(onProgress) {
  if (poseLandmarker) return poseLandmarker;
  if (isLoading) {
    // Wait for the ongoing load
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (poseLandmarker) { clearInterval(interval); resolve(poseLandmarker); }
        if (loadError)      { clearInterval(interval); reject(loadError); }
      }, 200);
    });
  }

  isLoading = true;
  onProgress?.('Loading AI model…');

  try {
    onProgress?.('Waiting for MediaPipe library…');
    const { PoseLandmarker, FilesetResolver } = await waitForMediaPipe();

    onProgress?.('Initializing WASM runtime…');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    onProgress?.('Loading pose model…');
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode:       'VIDEO',
      numPoses:          1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence:  0.5,
      minTrackingConfidence:      0.5,
    });

    isLoading = false;
    onProgress?.('Model ready ✓');
    return poseLandmarker;
  } catch (err) {
    isLoading = false;
    loadError = err;
    throw err;
  }
}

/**
 * Run pose detection on a single video frame.
 * @param {HTMLVideoElement} video
 * @param {number} timestamp  — performance.now() in ms
 * @returns {object[]|null}   — array of landmarks or null
 */
export function detectPose(video, timestamp) {
  if (!poseLandmarker) return null;
  try {
    const result = poseLandmarker.detectForVideo(video, timestamp);
    if (result.landmarks && result.landmarks.length > 0) {
      return result.landmarks[0]; // first person
    }
    return null;
  } catch {
    return null;
  }
}
