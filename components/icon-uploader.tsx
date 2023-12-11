import { useRef } from "react";
import ChatIcon from "./chat-icon";
import { getIconUrl } from "../utils/get-icon-url";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { User } from "firebase/auth";

type IconUploaderProps = {
  userImage: string | undefined;
  user: User;
  onUploadSuccess: (url: string) => void;
};

/* 画像リサイズ */
const maxWidth = 250;
const maxHeight = 250;

export const IconUploader = (props: IconUploaderProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        onClick={() => {
          imageInputRef.current?.click();
        }}
      >
        <ChatIcon
          src={props.userImage ?? "/user.png"}
          className="mx-2 border-2 border-slate-300"
          addable
        />
      </button>
      <input
        accept="image/*"
        type="file"
        hidden
        ref={imageInputRef}
        onChange={(e) => {
          if (!(e.target.files && e.target.files[0])) return;
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              const ctx = canvas.getContext("2d");
              if (ctx === null) return;
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              const aspectRatio = img.width / img.height;
              const sx = aspectRatio > 1 ? (img.width - img.height) / 2 : 0;
              const sy = aspectRatio <= 1 ? (img.height - img.width) / 2 : 0;
              const sWidth = aspectRatio > 1 ? img.height : img.width;
              const sHeight = aspectRatio <= 1 ? img.width : img.height;
              ctx.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                canvas.width,
                canvas.height
              );
              ctx.canvas.toBlob(async (blob) => {
                if (blob === null) return;
                const storage = getStorage();
                const storageRef = ref(storage, `/icons/${props.user.uid}`);
                await uploadBytes(storageRef, blob).catch(() => {
                  alert("画像のアップロード中にエラーが発生しました");
                });
                // アップロードに成功したとき
                const downloadUrl = await getIconUrl(props.user.uid);
                if (downloadUrl === undefined) {
                  alert("画像のアップロード中にエラーが発生しました");
                } else {
                  props.onUploadSuccess(downloadUrl);
                }
              }, "image/jpeg");
            };
            if (typeof reader.result !== "string") {
              return;
            }
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        }}
      />
    </>
  );
};
