import Image from "next/image";

export type ChatIconProps = {
  src: string;
  alt?: string;
  size?: number | string;
};

const ChatIcon = ({ src, alt = "", size = 40 }: ChatIconProps) => {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <Image src={src} alt={alt} fill className="rounded-full" />
    </div>
  );
};

export default ChatIcon;
