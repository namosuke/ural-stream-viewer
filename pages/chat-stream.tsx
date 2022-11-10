import { useChats } from "../hooks/use-chats";
import { useMemo, useState, useEffect } from "react";
import { getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ChatIcon from "../components/chat-icon";

const ChatStream = () => {
  const app = useMemo(() => getApp(), []);
  const db = useMemo(() => getFirestore(app), [app]);
  const chats = useChats(db);
  const displaySeconds = 10;
  type ChatToLane = {
    [chatId: string]: number;
  };
  const [chatToLane, setChatToLane] = useState<ChatToLane>({});

  useEffect(() => {
    setChatToLane((prev) => {
      const newChatToLane: ChatToLane = {};
      chats
        .filter(
          (chat) =>
            chat.createdAt &&
            Date.now() - chat.createdAt.getTime() < displaySeconds * 1000
        )
        .forEach((chat) => {
          if (prev[chat.id]) {
            newChatToLane[chat.id] = prev[chat.id];
          } else {
            newChatToLane[chat.id] = Math.floor(Math.random() * 10);
          }
        });
      return newChatToLane;
    });
  }, [chats]);

  return (
    <div
      className="relative h-[720px] w-[1280px] overflow-hidden whitespace-nowrap text-6xl font-bold text-white"
      style={{
        textShadow:
          "0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000",
      }}
    >
      <style>
        {`@keyframes chatStream {
            to {
              transform: translateX(calc(-100%));
            }
          }`}
      </style>
      {chats
        .filter(
          (chat) =>
            chat.createdAt &&
            Date.now() - chat.createdAt.getTime() < displaySeconds * 1000
        )
        .map((chat) => (
          <div
            key={chat.id}
            className="absolute flex items-center"
            style={{
              top: chatToLane[chat.id] * 70,
              // 10秒以内のコメントがすべて右端から出るが仕様
              transform: `translateX(1280px)`,
              animationDuration: `${displaySeconds}s`,
              animationName: "chatStream",
              animationTimingFunction: "linear",
              animationFillMode: "both",
              transformBox: "fill-box",
            }}
          >
            <ChatIcon src={chat.photoURL ?? "/user.png"} size={70} />
            <div className="ml-4 mr-1">{chat.text}</div>
          </div>
        ))}
    </div>
  );
};

export default ChatStream;
