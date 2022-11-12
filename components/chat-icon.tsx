import Image from "next/image";

export type ChatIconProps = {
  src: string;
  alt?: string;
  size?: number | string;
  className?: string;
};

const ChatIcon = ({ src, alt = "", size = 40, className }: ChatIconProps) => {
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
    </div>
  );
};

export default ChatIcon;
