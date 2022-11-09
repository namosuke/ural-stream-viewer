import Image from "next/image";

export type ChatIconProps = {
  src: string;
  alt?: string;
  size?: number;
};

const ChatIcon = ({ src, alt, size }: ChatIconProps) => {
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={size ?? 100}
      height={size ?? 100}
      layout="responsive"
      className="rounded-full"
    />
  );
};

export default ChatIcon;
