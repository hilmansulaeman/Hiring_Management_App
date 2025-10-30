import { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export type HandBox = { x:number; y:number; w:number; h:number } | null;

export function useHandBox(videoRef: React.RefObject<HTMLVideoElement>, enabled:boolean) {
  const [bbox,setBbox]=useState<HandBox>(null);
  const detectorRef=useRef<HandLandmarker|null>(null);
  const rafRef=useRef<number|null>(null);

  const loadDetector=useCallback(async()=>{
    if(detectorRef.current) return detectorRef.current;
    const vision=await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    detectorRef.current=await HandLandmarker.createFromOptions(vision,{
      baseOptions:{
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      },
      numHands:1,
      runningMode:"VIDEO",
    });
    return detectorRef.current;
  },[]);

  useEffect(()=>{
    let stopped=false;
    async function start(){
      if(!enabled) return;
      const video=videoRef.current;
      if(!video) return;

      // wait until metadata loaded
      if(video.readyState<2||video.videoWidth===0){
        console.log("[useHandBox] Waiting for video metadata to load...");
        await new Promise<void>(res=>video.addEventListener("loadedmetadata",()=>res(),{once:true}));
        console.log(`[useHandBox] Video metadata loaded. readyState=${video.readyState}, videoWidth=${video.videoWidth}, videoHeight=${video.videoHeight}`);
      }
      console.log(`[useHandBox] Video srcObject: ${video.srcObject ? 'present' : 'null'}`);

      const detector=await loadDetector();
      const tick=()=>{
        if(stopped) return;
        try{
          const now=performance.now();
          let lm = null; // Declare lm outside the if block
          // Only run detection if video is ready and not paused
          if (video.readyState === 4 && !video.paused) {
            console.log(`[useHandBox] Detecting for video. State: readyState=${video.readyState}, paused=${video.paused}, width=${video.videoWidth}, height=${video.videoHeight}`);
            const res=detector.detectForVideo(video!,now);
            lm=res.landmarks?.[0]; // Assign to lm
          } else {
            console.warn("[useHandBox] Video not ready or paused. Skipping detection.");
            setBbox(null);
          }

          if(lm){ // Now lm is accessible here
            const xs=lm.map((p:any)=>p.x);
            const ys=lm.map((p:any)=>p.y);
            const minX=Math.min(...xs),maxX=Math.max(...xs);
            const minY=Math.min(...ys),maxY=Math.max(...ys);
            const pad=0.06;
            setBbox({x:Math.max(0,minX-pad),y:Math.max(0,minY-pad),
                     w:Math.min(1,maxX+pad)-(Math.max(0,minX-pad)),
                     h:Math.min(1,maxY+pad)-(Math.max(0,minY-pad))});
          } else {
            setBbox(null);
          }
        }catch(e){console.error(e);setBbox(null);}
        rafRef.current=requestAnimationFrame(tick);
      };
      rafRef.current=requestAnimationFrame(tick);
    }
    start();
    return()=>{stopped=true;if(rafRef.current)cancelAnimationFrame(rafRef.current);}
  },[enabled,loadDetector,videoRef]);

  return bbox;
}