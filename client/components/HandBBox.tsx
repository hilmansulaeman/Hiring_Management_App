import React from 'react';
import { HandBox } from '@/hooks/useHandBox';
import { cn } from '@/lib/utils';

interface HandBBoxProps {
  handBox: HandBox | null;
  pose: number;
  sequenceStep: number;
  isWrongPose: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const HandBBox: React.FC<HandBBoxProps> = ({
  handBox,
  pose,
  sequenceStep,
  isWrongPose,
  videoRef,
}) => {
  if (!handBox || !videoRef.current) {
    return null;
  }

  const video = videoRef.current;
  const isVideoMirrored = video.classList.contains('scale-x-[-1]');

  const boxLeft = isVideoMirrored
    ? video.offsetWidth - (handBox.x + handBox.w) * video.offsetWidth
    : handBox.x * video.offsetWidth;
  const boxTop = handBox.y * video.offsetHeight;
  const boxWidth = handBox.w * video.offsetWidth;
  const boxHeight = handBox.h * video.offsetHeight;

  const borderColor = isWrongPose ? 'border-red-500' : 'border-emerald-500';
  const badgeBgColor = isWrongPose ? 'bg-red-500' : 'bg-emerald-500';
  const badgeTextColor = 'text-white';
  const badgeText = isWrongPose ? 'Wrong Pose' : `Pose ${pose}`;

  return (
    <div
      className={cn(
        "absolute rounded-md border-2",
        borderColor
      )}
      style={{
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
      }}
    >
      {pose !== 0 && ( // Only show badge if a pose is detected
        <div
          className={cn(
            "absolute -top-6 left-0 rounded-md px-2 py-0.5 text-xs font-semibold",
            badgeBgColor,
            badgeTextColor
          )}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
};