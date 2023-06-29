import { useState, useEffect } from "react";
import { Chat } from "./use-chats";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export type ChatUserIcon = {
  uid: string;
  url?: string;
};

export const useChatUserIcons = (chats: Chat[]) => {
  const [chatUserIcons, setChatUserIcons] = useState<ChatUserIcon[]>([]);

  useEffect(() => {
    const storage = getStorage();
    const uids = chats.map((chat) => chat.uid);
    const uidsUnique = [...new Set(uids)];
    const chatNewImagePromises = uidsUnique
      .filter(
        (uid) =>
          chatUserIcons.some((chatUserIcon) => chatUserIcon.uid === uid) ===
          false
      )
      .map(async (uid) => {
        const downloadUrl = await getDownloadURL(
          ref(storage, `/icons/${uid}`)
        ).catch(() => undefined);
        return { uid, url: downloadUrl };
      });
    Promise.allSettled(chatNewImagePromises).then((result) =>
      setChatUserIcons((prev) => {
        const newChatUserIcons: ChatUserIcon[] = [];
        result.forEach((item) => {
          if (item.status === "fulfilled") {
            newChatUserIcons.push(item.value);
          }
        });
        if (newChatUserIcons.length !== 0) {
          return [...prev, ...newChatUserIcons];
        }
        return prev;
      })
    );
  }, [chatUserIcons, chats]);

  return [chatUserIcons, setChatUserIcons] as const;
};
