import Image from "next/image";

const ChatIcon = ({ src }: { src: string }) => {
  return (
    <div className="w-10">
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        layout="responsive"
        className="rounded-full"
      />
    </div>
  );
};

export default ChatIcon;
