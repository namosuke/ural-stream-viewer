import Hls from "hls.js";
import { RefObject, useEffect, useRef } from "react";

const source = "https://live.omugi.org/live/index.m3u8";

export type Publish = {
  createdAt: Date;
  status: "liveStarted" | "liveEnded";
};

/** 動画配信情報制御 */
export const useVideoControl = (
  publish: Publish | undefined,
  videoRef: RefObject<HTMLVideoElement>,
  setVideoSrc: (value: string | undefined) => void
) => {
  const hls = useRef<Hls>();

  useEffect(() => {
    (async () => {
      if (publish?.status === "liveStarted") {
        // リクエストが成功するまで再送
        while (
          await fetch(source)
            .then((res) => !res.ok)
            .catch(() => true)
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // autoPictureInPictureはSafari PWAのみ対応？
        videoRef.current?.setAttribute("autoPictureInPicture", "");
        if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          setVideoSrc(source);
        } else if (videoRef.current && Hls.isSupported()) {
          hls.current = new Hls();
          hls.current.loadSource(source);
          hls.current.attachMedia(videoRef.current);
        }
      } else if (publish?.status === "liveEnded") {
        setVideoSrc(undefined);
        hls.current?.destroy();
      }
    })();
  }, [publish?.status, setVideoSrc, videoRef]);
};
