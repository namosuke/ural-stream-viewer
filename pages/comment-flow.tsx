import { useChats } from "../hooks/use-chats";
import { useMemo } from "react";
import { getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ChatIcon from "../components/chat-icon";

const CommentFlow = () => {
  const app = useMemo(() => getApp(), []);
  const db = useMemo(() => getFirestore(app), [app]);
  const chats = useChats(db);

  return (
    <div
      className="h-[720px] w-[1280px] overflow-hidden text-6xl font-bold text-white"
      style={{
        textShadow:
          "0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000",
      }}
    >
      {chats.map((chat) => (
        <div key={chat.id} className="flex">
          <ChatIcon src={chat.photoURL ?? "/user.png"} size={60} />
          <div>{chat.text}</div>
        </div>
      ))}
    </div>
  );
};

export default CommentFlow;
