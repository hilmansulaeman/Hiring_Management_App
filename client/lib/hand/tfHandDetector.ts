import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

let detector: handPoseDetection.HandDetector | null = null;

export async function getHandDetector(): Promise<handPoseDetection.HandDetector> {
  if (detector) return detector;
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
    runtime: 'tfjs',
    modelType: 'full',
    maxHands: 1,
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);
  return detector;
}