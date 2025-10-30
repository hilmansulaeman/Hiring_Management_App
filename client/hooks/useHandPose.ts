import { useEffect, useRef, useState } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { getHandDetector } from "../lib/hand/tfHandDetector";

export type PoseIndex = 0 | 1 | 2 | 3; // 0 = unknown

interface UseHandPoseOptions {
  video: HTMLVideoElement | null;
  enabled: boolean;
  fps?: number; // default 24
  holdMs?: number; // default 450, pose must be stable this long
  smoothWindow?: number; // default 5, median/mode smoothing
  isMirrored: boolean; // info only for UI; detector uses raw frame
}

// Landmark indices as per MediaPipe
const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];
const FINGER_MCPS = [2, 5, 9, 13, 17];

// PERBAIKAN KRUSIAL: Ambang batas minimum normalized palm width diturunkan drastis
const MIN_PALM_NORM = 0.01; // Disesuaikan: 0.06 -> 0.01 (Mendeteksi tangan sekecil mungkin)

export function useHandPose(opts: UseHandPoseOptions): {
  pose: PoseIndex; // stable pose after smoothing + hold
  rawCount: number; // current frame finger count (0..5)
  count: number; // smoothed count
  ready: boolean; // detector loaded
  error?: string;
  landmarks: handPoseDetection.Keypoint[][] | undefined;
  isRight: boolean | undefined; // inferred hand (right/left)
  isMirrored: boolean; // from options
  palmWidth: number | undefined; // normalized palm width
} {
  const {
    video,
    enabled,
    fps = 24,
    // PERBAIKAN: Mengurangi holdMs agar pose cepat terpicu
    holdMs = 150, // Disesuaikan: 450 -> 150
    smoothWindow = 5,
    isMirrored,
  } = opts;

  const [detector, setDetector] = useState<handPoseDetection.HandDetector | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [rawCount, setRawCount] = useState(0);
  const rawCountRef = useRef(0);
  const [count, setCount] = useState(0);
  const [pose, setPose] = useState<PoseIndex>(0);
  const [landmarks, setLandmarks] = useState<handPoseDetection.Keypoint[][] | undefined>(undefined);
  const [isRight, setIsRight] = useState<boolean | undefined>(undefined);
  const [palmWidth, setPalmWidth] = useState<number | undefined>(undefined);

  const frameId = useRef<number | null>(null);
  const poseHistory = useRef<number[]>([]);
  const lastStablePose = useRef<PoseIndex>(0);
  const lastStableTime = useRef<number>(0);
  const lastHandSeenAt = useRef<number>(0);

  // ---------- math helpers ----------
  // Perbaikan: Hanya gunakan X dan Y untuk distance agar stabil
  const distance = (p1: handPoseDetection.Keypoint, p2: handPoseDetection.Keypoint) =>
    Math.hypot((p1.x ?? 0) - (p2.x ?? 0), (p1.y ?? 0) - (p2.y ?? 0));

  const sub = (a: handPoseDetection.Keypoint, b: handPoseDetection.Keypoint) => ({
    x: (a.x ?? 0) - (b.x ?? 0),
    y: (a.y ?? 0) - (b.y ?? 0),
    z: (a.z ?? 0) - (b.z ?? 0),
  });
  const dot = (u: any, v: any) => u.x * v.x + u.y * v.y + u.z * v.z;
  const norm = (u: any) => Math.hypot(u.x, u.y, u.z);
  const cosAngle = (u: any, v: any) => {
    const nu = norm(u), nv = norm(v);
    if (nu === 0 || nv === 0) return -1;
    return dot(u, v) / (nu * nv);
  };

  const getPalmWidth = (lm: handPoseDetection.Keypoint[]): number | undefined => {
    if (!lm || lm.length < 21) return undefined;
    const indexMcp = lm[5];
    const pinkyMcp = lm[17];
    return distance(indexMcp, pinkyMcp);
  };

  const nDist = (
    a: handPoseDetection.Keypoint,
    b: handPoseDetection.Keypoint,
    palmW: number
  ) => (palmW ? distance(a, b) / palmW : 0);

  const isFingerExtended = (
    lm: handPoseDetection.Keypoint[],
    fingerIndex: number,
    palmW: number
  ): boolean => {
    const tip = lm[FINGER_TIPS[fingerIndex]];
    const pip = lm[FINGER_PIPS[fingerIndex]];
    const mcp = lm[FINGER_MCPS[fingerIndex]];
    if (!tip || !pip || !mcp || !palmW) return false;

    // Sangat Longgar: 0.85 -> 0.70 (Memungkinkan jari lebih bengkok)
    const straightEnough = cosAngle(v1, v2) > 0.70; 
    // Longgar: 1.08 -> 1.03
    const tipFurther = nDist(tip, mcp, palmW) > nDist(pip, mcp, palmW) * 1.03;

    if (fingerIndex === 0) {
      // Thumb special-case: lateral extension relative to palm axis
      const wrist = lm[0];
      const indexMcp = lm[5];
      if (!wrist || !indexMcp) return false;
      const palmAxis = sub(indexMcp, wrist);
      const thumbAxis = sub(tip, mcp);
      // Longgar: 0.6 -> 0.80
      const lateralEnough = Math.abs(cosAngle(palmAxis, thumbAxis)) < 0.80; 
      
      const tipDist2d = Math.hypot(tip.x - mcp.x, tip.y - mcp.y);
      const pipDist2d = Math.hypot(pip.x - mcp.x, pip.y - mcp.y);
      // Longgar: 1.05 -> 1.01
      const tipFurther2d = tipDist2d > pipDist2d * 1.01; 

      return tipFurther2d && lateralEnough; 
    }
    return straightEnough && tipFurther;
  };

  // ---------- init detector ----------
  useEffect(() => {
    if (enabled && !detector) {
      getHandDetector()
        .then((d) => {
          setDetector(d);
          setReady(true);
        })
        .catch((e) => {
          console.error("Failed to load HandDetector:", e);
          setError("Failed to load hand detection model.");
          setReady(false);
        });
    }
  }, [enabled, detector]);

  // ---------- per-frame detection ----------
  useEffect(() => {
    if (!enabled || !detector || !ready) {
      if (frameId.current) cancelAnimationFrame(frameId.current);
      frameId.current = null;
      setRawCount(0);
      setCount(0);
      setPose(0);
      setLandmarks(undefined);
      setIsRight(undefined);
      setPalmWidth(undefined);
      poseHistory.current = [];
      lastStablePose.current = 0;
      lastStableTime.current = 0;
      return;
    }

    let lastVideoTime = -1;
    let animationFrameId: number;

    const detectHand = async () => {
      if (video && video.readyState === 4 && !video.paused && video.currentTime !== lastVideoTime) {
        const hands = await detector.estimateHands(video);
        lastVideoTime = video.currentTime;

        if (hands && hands.length > 0) {
          const hand = hands[0];
          const lms = hand.keypoints;
          setLandmarks([lms]);

          const palmW = getPalmWidth(lms);
          if (!palmW || palmW < MIN_PALM_NORM) {
            // Hand too small / unreliable — grace period 150ms
            if (lastHandSeenAt.current && performance.now() - lastHandSeenAt.current > 150) {
              rawCountRef.current = 0;
              setRawCount(0);
              setPalmWidth(palmW);
            }
          } else {
            // Tangan berhasil dideteksi di sini
            lastHandSeenAt.current = performance.now();
            setPalmWidth(palmW);

            const handedness = (hand as any).handedness as string | undefined;
            setIsRight(handedness ? handedness === "Right" : undefined);

            let extended = 0;
            for (let i = 0; i < 5; i++) if (isFingerExtended(lms, i, palmW)) extended++;

            rawCountRef.current = extended;
            setRawCount(extended);
          }
        } else {
          // No hands — grace period 150ms
          if (lastHandSeenAt.current && performance.now() - lastHandSeenAt.current > 150) {
            rawCountRef.current = 0;
            setRawCount(0);
            setLandmarks(undefined);
            setIsRight(undefined);
            setPalmWidth(undefined);
          }
        }
      } else if (video && video.readyState === 4) {
         // Video paused or frame time is the same
      } else {
         if (lastHandSeenAt.current && performance.now() - lastHandSeenAt.current > 150) {
            rawCountRef.current = 0;
            setRawCount(0);
         }
      }
      animationFrameId = requestAnimationFrame(detectHand);
    };

    animationFrameId = requestAnimationFrame(detectHand);
    frameId.current = animationFrameId;

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
      frameId.current = null;
    };
  }, [enabled, video, detector, ready]);

  // ---------- smoothing & hold ----------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!enabled || !ready) return;

      poseHistory.current.push(rawCountRef.current);
      if (poseHistory.current.length > smoothWindow) poseHistory.current.shift();

      // mode of window
      const counts: Record<number, number> = {};
      for (const c of poseHistory.current) counts[c] = (counts[c] || 0) + 1;
      let smoothedCount = 0;
      let maxCount = -1;
      for (const key in counts) {
        const k = parseInt(key, 10);
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          smoothedCount = k;
        }
      }
      setCount(smoothedCount);

      // map to pose
      let currentPose: PoseIndex = 0;
      if (smoothedCount === 1) currentPose = 1;
      else if (smoothedCount === 2) currentPose = 2;
      else if (smoothedCount >= 3) currentPose = 3; 

      const now = performance.now();
      if (currentPose === lastStablePose.current) {
        if (now - lastStableTime.current >= holdMs) { // holdMs = 150
          if (pose !== currentPose) setPose(currentPose);
        }
      } else {
        lastStablePose.current = currentPose;
        lastStableTime.current = now;
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [enabled, ready, fps, holdMs, smoothWindow, pose]);

  return { pose, rawCount, count, ready, error, landmarks, isRight, isMirrored, palmWidth };
}