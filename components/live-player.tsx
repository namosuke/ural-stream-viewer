import { RefObject, useState } from "react";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";

type LivePlayerProps = {
  videoSrc: string | undefined;
  videoRef: RefObject<HTMLVideoElement>;
};

export const LivePlayer = (props: LivePlayerProps) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="sticky top-0 z-20 bg-black">
      <video
        src={props.videoSrc}
        ref={props.videoRef}
        autoPlay
        muted={isMuted}
        playsInline
        controls
        poster="https://live.omugi.org/img/thumb.png"
        className="mx-auto max-h-[50vh] max-w-full"
        crossOrigin="anonymous"
      ></video>
      {isMuted && (
        <button
          className="absolute left-0 top-0 right-0 bottom-0"
          onClick={() => {
            setIsMuted(false);
          }}
        >
          <div className="absolute left-0 top-0 m-6 inline-block rounded-lg bg-slate-800 py-3 px-4 text-base text-white">
            <div className="flex items-center">
              <VolumeOffRoundedIcon className="mr-2" />
              ミュート解除
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
