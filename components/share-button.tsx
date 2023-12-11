import { RefObject } from "react";
import IosShareIcon from "@mui/icons-material/IosShare";

export const ShareButton = ({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  return (
    <button
      className="mx-2 text-slate-700"
      onClick={() => {
        if (videoRef.current) {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas
            .getContext("2d")
            ?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "screenshot.png", {
                type: "image/png",
              });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                  files: [file],
                  text: `#ural_live\n${window.location.href}`,
                });
              }
            }
          });
        }
      }}
    >
      <IosShareIcon />
    </button>
  );
};
