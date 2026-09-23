import * as faceapi from "face-api.js";

let modelsLoaded = false;

/**
 * Loads face-api models lazily on first call.
 * The models must be present in the public/models directory.
 */
export async function loadFaceApiModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    // We only need basic detection for face presence
  ]);
  modelsLoaded = true;
}

export type ImageClassification = "hero" | "about" | "reviewLogos" | "unknown";

/**
 * Classifies an image file based on aspect ratio and presence of human faces.
 *
 * Rules:
 * - Landscape + Faces -> "hero" (often the background or main highlight)
 * - Portrait/Square + Faces -> "about" (founder/team photo)
 * - No faces -> generic slot
 */
export async function classifyImage(file: File): Promise<ImageClassification> {
  await loadFaceApiModels();

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = async () => {
      const isLandscape = img.width > img.height * 1.2;
      
      // Use tinyFaceDetector for speed
      const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
      );

      const hasFaces = detections.length > 0;
      URL.revokeObjectURL(url);

      if (hasFaces) {
        return resolve(isLandscape ? "hero" : "about");
      } else {
        // Without faces, landscape is still often good for hero or about background
        return resolve(isLandscape ? "hero" : "about");
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("unknown");
    };
  });
}
