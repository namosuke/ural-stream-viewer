import { RefObject, useEffect } from "react";

interface HTMLVideoElementWithPip extends HTMLVideoElement {
  webkitPresentationMode: "inline" | "picture-in-picture" | "fullscreen";
}

export const usePip = (
  videoRef: RefObject<HTMLVideoElement>,
  setIsPipActive: (value: boolean) => void,
  videoSrc: string | undefined
) => {
  useEffect(() => {
    videoRef.current?.addEventListener("enterpictureinpicture", () => {
      setIsPipActive(true);
    });
    videoRef.current?.addEventListener("leavepictureinpicture", () => {
      setIsPipActive(false);
    });
    videoRef.current?.addEventListener("webkitpresentationmodechanged", () => {
      setIsPipActive(
        (videoRef.current as HTMLVideoElementWithPip)
          ?.webkitPresentationMode === "picture-in-picture"
      );
    });
  }, [videoSrc, setIsPipActive, videoRef]);
};
