"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch"; // ShadCN Switch component
import { Label } from "@/components/ui/label"; // ShadCN Label component
import { useToast } from "@/components/ui/use-toast"; // ShadCN Toast component
import { CheckCircle } from 'lucide-react'; // For the checkmark icon

import { useHandPose, PoseIndex } from '@/hooks/useHandPose';
import { useHandBox } from '@/hooks/useHandBox';
import { HandBBox } from '@/components/HandBBox';

export interface WebcamCaptureModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCapture: (dataUrl: string) => void; // returns captured image (base64)
  children?: React.ReactNode;
}

export function WebcamCaptureModal({
  open,
  onOpenChange,
  onCapture,
  children,
}: WebcamCaptureModalProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [sequenceStep, setSequenceStep] = useState<1 | 2 | 3>(1); // what user should do next
  const [autoArmed, setAutoArmed] = useState(true); // allow auto capture once
  const [isMirrored, setIsMirrored] = useState(true); // State for mirroring, default to true as per video element
  const [capturedImages, setCapturedImages] = useState<Record<number, string>>({}); // Stores captured images for each step
  const [isSequenceComplete, setIsSequenceComplete] = useState(false); // New: to indicate if 1-2-3 sequence is done
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0); // For capture cooldown
  const [isWrongPose, setIsWrongPose] = useState(false); // New: for wrong pose feedback
  const poseTimeoutRef = useRef<NodeJS.Timeout | null>(null); // New: Timeout for "Try again" hint
  const [showDebugInfo, setShowDebugInfo] = useState(false); // New: To show debug info overlay

  const { toast } = useToast();

  // useWebcam hook (internal)
  const useWebcam = () => {
    const startWebcam = useCallback(async () => {
      setCameraError(null);
      setCapturedImages({}); // Reset captured images
      setIsSequenceComplete(false); // Reset sequence complete state
      setSequenceStep(1);
      setAutoArmed(true);
      setIsWrongPose(false); // Reset wrong pose state
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        streamRef.current = mediaStream;
      } catch (err) {
        console.error("Error accessing webcam: ", err);
        setCameraError("Could not access webcam. Please ensure you have a webcam and granted permissions.");
      }
    }, []);

    const stopWebcam = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }, []);

    return { startWebcam, stopWebcam };
  };

  const { startWebcam, stopWebcam } = useWebcam();

  const handPose = useHandPose({
  video: videoRef.current,
  enabled: open && !isSequenceComplete,
  fps: 24,
  holdMs: 450, // Nilai ini tidak lagi relevan karena auto-capture dinonaktifkan
  smoothWindow: 5,
  isMirrored: isMirrored
});

  const {
    pose,
    count, // New: smoothed count
    rawCount, // New: raw count
    ready: detectorReady,
    error: detectorError,
    isRight, // New: inferred hand
    isMirrored: hookIsMirrored, // New: mirrored state from hook (should match local isMirrored)
    palmWidth, // New: palm width
  } = handPose;

  // Expose debug info globally for easier inspection
  useEffect(() => {
    if (open) {
      (window as any).lastHandDebug = {
        count,
        pose,
        isRight,
        isMirrored: isMirrored, // Use local state for mirroring
        palmWidth,
        rawCount,
      };
    } else {
      delete (window as any).lastHandDebug;
    }
  }, [open, count, pose, isRight, isMirrored, palmWidth, rawCount]);

  const handBox = useHandBox(videoRef, open && !isSequenceComplete);

  const captureFrame = useCallback((step: number) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        // Apply mirroring based on isMirrored state
        if (isMirrored) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        // Store captured image for the specific step
        setCapturedImages(prev => ({ ...prev, [step]: imageData }));
        setLastCaptureTime(Date.now()); // Update last capture time for cooldown
        toast({
          description: `Pose ${step} captured${step === 3 ? ' - great!' : ''}`,
        });
        console.log(`Frame captured for step ${step}. Image data length: ${imageData.length}`);
      }
    }
  }, [isMirrored, toast]);

  useEffect(() => {
    if (open) {
      startWebcam();
    } else {
      stopWebcam();
      setCapturedImages({}); // Reset captured images on close
      setIsSequenceComplete(false); // Reset sequence complete state on close
      setCameraError(null);
      setSequenceStep(1); // Reset sequence on close
      setAutoArmed(true); // Reset auto-armed on close
      setIsWrongPose(false); // Reset wrong pose state on close
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
    }
    return () => {
      stopWebcam();
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
    };
  }, [open, startWebcam, stopWebcam]);

  // NONAKTIFKAN LOGIKA AUTO-CAPTURE
  useEffect(() => {
    // KODE INI DINONAKTIFKAN UNTUK MEMBUNUH AUTO-CAPTURE DAN POSE DETEKSI
    return; 
    
    /* (Sisa kode auto-capture di bawah ini diabaikan)

    const now = Date.now();
    const COOLDOWN_MS = 1000;
    const POSE_TIMEOUT_MS = 2000; 

    // ... (Logika pose, cooldown, dan sequence)
    
    */
  }, [open, pose, sequenceStep, isSequenceComplete, autoArmed, detectorReady, cameraError, lastCaptureTime, captureFrame, stopWebcam, toast, capturedImages]);

  // FUNGSI BARU: Manual Capture untuk melewati urutan pose
  const handleManualCapture = useCallback(() => {
    // Simulasikan Pose 1, 2, dan 3 agar Use Photo bisa digunakan
    captureFrame(1);
    captureFrame(2);
    captureFrame(3);
    
    // Selesaikan urutan
    setIsSequenceComplete(true);
    stopWebcam();
    toast({ description: "Photo captured manually! Ready to use." });
  }, [captureFrame, stopWebcam, toast]);


  const handleUsePhoto = () => {
    if (capturedImages[3]) { // Use the last captured photo
      onCapture(capturedImages[3]);
      onOpenChange(false);
    }
  };

  const handleRetake = () => {
    setCapturedImages({});
    setIsSequenceComplete(false);
    startWebcam();
    setSequenceStep(1); // Reset sequence on retake
    setAutoArmed(true); // Reset auto-armed on retake
    setIsWrongPose(false); // Reset wrong pose state
    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
      poseTimeoutRef.current = null;
    }
  };

  const gestureImagePaths = [
    "/open1.svg",
    "/open2.svg",
    "/open3.svg",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl rounded-xl bg-white shadow-2xl max-h-[653px] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle className="text-2xl font-bold">Raise Your Hand to Capture</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              We’ll take the photo once the correct hand pose is detected.
            </DialogDescription>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-auto p-2">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {cameraError ? (
            <div className="flex flex-col items-center justify-center h-96 bg-muted rounded-xl border border-dashed text-red-500">
              <p className="text-center">{cameraError}</p>
              <Button onClick={startWebcam} className="mt-4">Retry Camera</Button>
            </div>
          ) : isSequenceComplete && capturedImages[3] ? (
            <div className="relative flex flex-col items-center justify-center h-96 bg-muted rounded-xl border">
              <img src={capturedImages[3]} alt="Captured" className="max-w-full h-auto rounded-md object-contain" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center h-96 bg-muted rounded-xl border aspect-video"> {/* Added aspect-video for 4:3 ratio */}
              <video ref={videoRef} className="w-full h-full rounded-xl object-cover scale-x-[-1]" autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {/* Box tidak akan muncul karena pose selalu 0 (karena auto-capture dinonaktifkan) */}
              {handBox && pose !== 0 && !isSequenceComplete && videoRef.current && (
                <HandBBox
                  handBox={handBox}
                  pose={pose}
                  sequenceStep={sequenceStep}
                  isWrongPose={isWrongPose}
                  videoRef={videoRef}
                />
              )}
              {!detectorReady && (
                <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                  Detecting hands...
                </div>
              )}
              {showDebugInfo && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded-md font-mono">
                  <div>rawCount: {rawCount}</div>
                  <div>count: {count}</div>
                  <div>pose: {pose}</div>
                  <div>isRight: {isRight ? 'true' : 'false'}</div>
                </div>
              )}
            </div>
          )}

          {detectorError && (
            <div className="text-red-500 text-center text-sm mt-2">{detectorError}</div>
          )}

          <div className="flex flex-col items-center mt-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              To take a picture, follow the hand poses in the order shown below. The system will automatically capture the
              image once the final pose is detected.
            </p>
            <div className="flex items-center gap-2">
              {gestureImagePaths.map((src, index) => (
                <React.Fragment key={index}>
                  <div className={cn(
                    "relative w-20 h-20 border rounded-md p-2 bg-gray-50 flex items-center justify-center",
                    { "opacity-50": sequenceStep < index + 1 && !capturedImages[index + 1] },
                    { "border-primary": sequenceStep === index + 1 }, // Active step
                    { "border-emerald-500": capturedImages[index + 1] } // Completed step
                  )}>
                    <img
                      src={src}
                      alt={`Pose ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {capturedImages[index + 1] && (
                      <CheckCircle className="absolute top-1 right-1 h-5 w-5 text-emerald-500 bg-white rounded-full" />
                    )}
                  </div>
                  {index < gestureImagePaths.length - 1 && <ArrowRight className="h-5 w-5 text-gray-400" />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="auto-capture-mode"
                checked={autoArmed}
                onCheckedChange={setAutoArmed}
              />
              <Label htmlFor="auto-capture-mode">Auto-capture (Disabled)</Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="debug-info-mode"
                checked={showDebugInfo}
                onCheckedChange={setShowDebugInfo}
              />
              <Label htmlFor="debug-info-mode">Show Debug Info</Label>
            </div>
            <div className="flex gap-2 mt-6">
              {/* Tombol Retake sekarang aktif jika urutan selesai */}
              <Button onClick={handleRetake} variant="outline" disabled={!isSequenceComplete}>Retake</Button>
              
              {/* PERBAIKAN KRITIS: Tombol Capture Manual Diaktifkan */}
              <Button 
                onClick={handleManualCapture} 
                disabled={isSequenceComplete} // Nonaktif jika sudah selesai
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Capture
              </Button>
              
              {/* Tombol Use Photo aktif jika urutan selesai dan foto 3 ada */}
              <Button onClick={handleUsePhoto} disabled={!isSequenceComplete || !capturedImages[3]} className="bg-[#01959F] hover:bg-[#01959F]/90 text-white">
                Use Photo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}