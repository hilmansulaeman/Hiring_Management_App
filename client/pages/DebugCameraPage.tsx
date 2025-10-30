"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { X, Camera, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { useHandPose, PoseIndex } from '@/hooks/useHandPose';
import { useHandBox } from '@/hooks/useHandBox';
import { HandBBox } from '@/components/HandBBox';

export default function DebugCameraPage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true); // State for mirroring, default to true as per video element
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0); // For capture cooldown
  const [isWrongPose, setIsWrongPose] = useState(false); // For wrong pose feedback
  const poseTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for "Try again" hint

  const { toast } = useToast();

  const COOLDOWN_MS = 2500; // 2.5 seconds cooldown after each capture
  const POSE_TIMEOUT_MS = 2000; // 2 seconds timeout if pose not held or incorrect

  // useWebcam hook (internal)
  const useWebcam = () => {
    const startWebcam = useCallback(async () => {
      setCameraError(null);
      setCapturedImage(null); // Reset captured image
      setIsWrongPose(false); // Reset wrong pose state
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
      console.log("[DebugCameraPage] Attempting to start webcam...");
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          console.log("[DebugCameraPage] Webcam started successfully.");
        }
        streamRef.current = mediaStream;
      } catch (err) {
        console.error("[DebugCameraPage] Error accessing webcam: ", err);
        setCameraError("Could not access webcam. Please ensure you have a webcam and granted permissions.");
      }
    }, []);

    const stopWebcam = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        console.log("[DebugCameraPage] Webcam stopped.");
      }
    }, []);

    return { startWebcam, stopWebcam };
  };

  const { startWebcam, stopWebcam } = useWebcam();

  const {
    pose,
    count,
    rawCount,
    ready: detectorReady,
    error: detectorError,
    isRight,
    isMirrored: hookIsMirrored,
    palmWidth,
  } = useHandPose({
    video: videoRef.current,
    enabled: true, // Always enabled for debug page
    fps: 24,
    holdMs: 500,
    smoothWindow: 5,
    isMirrored: isMirrored
  });

  const handBox = useHandBox(videoRef, true); // Always enabled for debug page

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        if (isMirrored) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        setLastCaptureTime(Date.now());
        toast({ description: "Photo captured!" });
        console.log(`[DebugCameraPage] Frame captured. Image data length: ${imageData.length}`);
        stopWebcam(); // Stop webcam after capture
      }
    }
  }, [isMirrored, toast, stopWebcam]);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
    };
  }, [startWebcam, stopWebcam]);

  // Auto-capture logic for pose === 3
  useEffect(() => {
    console.log("[DebugCameraPage] Auto-capture useEffect triggered. Current state:", {
      autoCaptureEnabled,
      detectorReady,
      cameraError,
      pose,
      lastCaptureTime,
      capturedImage: !!capturedImage,
    });

    if (!autoCaptureEnabled || !detectorReady || cameraError || capturedImage) {
      console.log("[DebugCameraPage] Auto-capture conditions not met. Returning.");
      return;
    }

    const now = Date.now();
    const COOLDOWN_MS = 2500;

    if (now - lastCaptureTime < COOLDOWN_MS) {
      setIsWrongPose(false);
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
      console.log("[DebugCameraPage] In cooldown period. Returning.");
      return;
    }

    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
      poseTimeoutRef.current = null;
    }

    if (pose === 3) {
      setIsWrongPose(false);
      console.log("[DebugCameraPage] Pose 3 detected. Triggering capture.");
      captureFrame();
    } else if (pose === 1 || pose === 2) { // Explicitly check for poses 1 or 2
      setIsWrongPose(true);
      console.log(`[DebugCameraPage] Wrong pose detected: ${pose}. Expected: 3`);
      poseTimeoutRef.current = setTimeout(() => {
        toast({
          description: `Try again: show Pose 3`,
          variant: "destructive",
        });
        setIsWrongPose(false);
        console.log(`[DebugCameraPage] Toast: Try again for Pose 3`);
      }, POSE_TIMEOUT_MS);
    } else if (pose === 0) {
      console.log("[DebugCameraPage] No hand detected (pose 0).");
      poseTimeoutRef.current = setTimeout(() => {
        toast({
          description: `Raise your hand for Pose 3`,
          variant: "destructive",
        });
        setIsWrongPose(false);
        console.log(`[DebugCameraPage] Toast: Raise your hand for Pose 3`);
      }, POSE_TIMEOUT_MS);
    }
  }, [autoCaptureEnabled, detectorReady, cameraError, pose, lastCaptureTime, capturedImage, captureFrame, stopWebcam, toast]);

  // Keyboard shortcut for manual capture (key 'C')
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'c' || event.key === 'C') {
        if (!capturedImage && !cameraError) {
          console.log("[DebugCameraPage] Manual capture triggered by 'C' key.");
          captureFrame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [capturedImage, cameraError, captureFrame]);

  // Expose debug info globally for easier inspection
  useEffect(() => {
    (window as any).lastHandDebug = {
      count,
      pose,
      isRight,
      isMirrored: isMirrored,
      palmWidth,
      rawCount,
    };
    return () => {
      delete (window as any).lastHandDebug;
    };
  }, [count, pose, isRight, isMirrored, palmWidth, rawCount]);


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Debug Camera & Hand Pose Capture</h1>

      <div className="grid gap-4 py-4">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center h-96 bg-muted rounded-xl border border-dashed text-red-500">
            <p className="text-center">{cameraError}</p>
            <Button onClick={startWebcam} className="mt-4">Retry Camera</Button>
          </div>
        ) : capturedImage ? (
          <div className="relative flex flex-col items-center justify-center h-96 bg-muted rounded-xl border">
            <img src={capturedImage} alt="Captured" className="max-w-full h-auto rounded-md object-contain" />
            <Button onClick={startWebcam} className="mt-4">Retake Photo</Button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center h-96 bg-muted rounded-xl border aspect-video">
            <video ref={videoRef} className="w-full h-full rounded-xl object-cover scale-x-[-1]" autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {handBox && pose !== 0 && videoRef.current && (
              <HandBBox
                handBox={handBox}
                pose={pose}
                sequenceStep={pose} // Use current pose as sequence step for display
                isWrongPose={isWrongPose}
                videoRef={videoRef}
              />
            )}
            {!detectorReady && (
              <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                Detecting hands...
              </div>
            )}
            {detectorError && (
              <div className="absolute bottom-4 left-4 text-red-500 text-xs px-2 py-1 rounded-md bg-gray-800">
                {detectorError}
              </div>
            )}
            <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
              Pose: {pose} (Raw: {rawCount})
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="auto-capture-mode"
              checked={autoCaptureEnabled}
              onCheckedChange={setAutoCaptureEnabled}
            />
            <Label htmlFor="auto-capture-mode">Auto-capture (Pose 3)</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={captureFrame} disabled={!!capturedImage || !!cameraError}>
              <Camera className="mr-2 h-4 w-4" /> Manual Capture (Press 'C')
            </Button>
            <Button onClick={startWebcam} disabled={!capturedImage && !cameraError}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
