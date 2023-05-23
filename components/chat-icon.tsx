import Image from "next/image";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

export type ChatIconProps = {
  src: string;
  alt?: string;
  size?: number | string;
  className?: string;
  addable?: boolean;
};

const ChatIcon = ({
  src,
  alt = "",
  size = 40,
  className,
  addable,
}: ChatIconProps) => {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
      }}
      className={className}
    >
      <Image src={src} alt={alt} fill />
      {addable && (
        <div className="relative z-10 flex h-full w-full items-center justify-center bg-slate-700/70 opacity-0 hover:opacity-100">
          <AddPhotoAlternateIcon className="text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatIcon;
