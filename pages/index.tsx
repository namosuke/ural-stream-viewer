import Head from "next/head";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Layout from "../components/layout";
import { getApp } from "firebase/app";
import { getAuth, User, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import ChatIcon from "../components/chat-icon";
import PictureInPictureIcon from "@mui/icons-material/PictureInPicture";
import EditIcon from "@mui/icons-material/Edit";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ElapsedTime from "../components/elapsed-time";
import ElapsedTimeAbout from "../components/elapsed-time-about";
import { useChats } from "../hooks/use-chats";
import { useChatUserIcons } from "../hooks/use-chat-user-icons";
import { getIconUrl } from "../utils/get-icon-url";
import { Publish, useVideoControl } from "../hooks/use-video-control";
import { useAutoLogin } from "../hooks/use-auto-login";
import { usePip } from "../hooks/use-pip";
import { LivePlayer } from "../components/live-player";
import { YoutubePlayer } from "../components/youtube-player";
import { ShareButton } from "../components/share-button";
import { IconUploader } from "../components/icon-uploader";

const Home = () => {
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const app = useMemo(() => getApp(), []);
  const auth = useMemo(() => getAuth(app), [app]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>();
  const [isOpenNameEdit, setIsOpenNameEdit] = useState<boolean>(false);
  const db = useMemo(() => getFirestore(app), [app]);

  const [chatInput, setChatInput] = useState("");

  const chats = useChats(db);
  const [chatUserIcons, setChatUserIcons] = useChatUserIcons(chats);

  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  const [publish, setPublish] = useState<Publish>();
  const [userImage, setUserImage] = useState<string | undefined>();

  useVideoControl(publish, videoRef, setVideoSrc);

  const loginCallback = useCallback(async (user: User | null) => {
    if (user) {
      setUser(user);
      setUserImage(await getIconUrl(user.uid));
    }
    setIsAuthLoading(false);
  }, []);

  useAutoLogin(auth, loginCallback);

  const chatSubmit = () => {
    if (user !== null && chatInput !== "") {
      addDoc(collection(db, "chats"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        text: chatInput,
        name: displayName ?? "名無し",
        photoURL: null,
      });
      setChatInput("");
    }
  };

  useEffect(() => {
    setIsPipSupported(document.pictureInPictureEnabled);
  }, []);

  usePip(videoRef, setIsPipActive, videoSrc);

  const pipClick = async () => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current !== document.pictureInPictureElement) {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      } else {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 配信ステータス更新 */
  useEffect(() => {
    const q = query(
      collection(db, "publishes"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    onSnapshot(q, (QuerySnapshot) => {
      setPublish(
        QuerySnapshot.docs.map((doc) => ({
          createdAt: doc.data().createdAt.toDate(),
          status: doc.data().status,
        }))[0]
      );
    });
  }, [db]);

  /* localStorage */
  useEffect(() => {
    const displayName = localStorage.getItem("displayName");
    if (displayName) setDisplayName(displayName);
  }, []);

  return (
    <Layout>
      <Head>
        <title>ウラルのゲームライブ</title>
        <meta property="og:url" content="https://live.ural.ink" />
        <meta property="og:type" content="" />
        <meta property="og:title" content="ウラルのゲームライブ" />
        <meta
          property="og:description"
          content="ウラルが自分用に作った動画配信システム！"
        />
        <meta
          property="og:image"
          content="https://live.ural.ink/thumb-default.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@barley_ural" />
      </Head>
      <div className="h-full min-h-screen w-full">
        <div className="m-2 text-center">ウラルのゲームライブ</div>
        {publish?.status === "liveStarted" && (
          <LivePlayer videoRef={videoRef} videoSrc={videoSrc} />
        )}
        {publish?.status === "liveEnded" && <YoutubePlayer />}
        <div className="mx-auto max-w-3xl">
          {publish?.status === "liveStarted" ? (
            <div className="flex items-center justify-between">
              <div className="m-2 flex items-center text-sm text-slate-400">
                <ShareButton videoRef={videoRef} />
                <ElapsedTime from={publish.createdAt} />
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPipSupported && isPipActive}
                    onChange={pipClick}
                    disabled={!isPipSupported}
                  />
                }
                label={
                  <PictureInPictureIcon
                    className="text-slate-700"
                    titleAccess="ピクチャー・イン・ピクチャーを有効にする"
                  />
                }
                labelPlacement="start"
                style={{
                  marginRight: "0",
                }}
              />
            </div>
          ) : (
            <div className="m-2 text-sm text-slate-400">
              {publish?.status === "liveEnded" ? (
                <>
                  ライブは
                  <ElapsedTimeAbout from={publish.createdAt} />
                  前に終了しました
                </>
              ) : (
                "Loading..."
              )}
            </div>
          )}
          {user ? (
            <div className="flex items-start p-2">
              <IconUploader
                userImage={userImage}
                user={user}
                onUploadSuccess={(url) => {
                  setUserImage(url);
                  setChatUserIcons((prev) => [
                    ...prev.filter((item) => item.uid !== user.uid),
                    {
                      uid: user.uid,
                      url,
                    },
                  ]);
                }}
              />
              <div className="w-full">
                {isOpenNameEdit ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      localStorage.setItem("displayName", e.target.value);
                    }}
                    className="mb-2 w-full rounded-md border-2 border-slate-200 p-1"
                    placeholder="名前"
                    enterKeyHint="done"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setIsOpenNameEdit(false);
                      }
                    }}
                    onBlur={() => setIsOpenNameEdit(false)}
                  />
                ) : (
                  <>
                    <span className="font-bold">{displayName ?? "名無し"}</span>
                    <button
                      className="ml-2"
                      title="名前を編集する"
                      onClick={() => setIsOpenNameEdit(true)}
                    >
                      <EditIcon
                        className="relative text-slate-500"
                        style={{
                          fontSize: "16px",
                          top: "-2px",
                        }}
                      />
                    </button>
                  </>
                )}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full rounded-md border-2 border-slate-200 p-1"
                  placeholder="チャットを入力"
                  enterKeyHint="send"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      chatSubmit();
                    }
                  }}
                />
              </div>
            </div>
          ) : isAuthLoading ? (
            <div className="m-2 text-sm text-slate-400">Loading...</div>
          ) : (
            <button
              onClick={() => {
                setIsAuthLoading(true);
                signInAnonymously(auth);
              }}
              className="m-2 flex items-center rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-600"
            >
              <div>チャットに参加する</div>
            </button>
          )}
          <div>
            {chats.map((chat) => (
              <div key={chat.id} className="m-4 flex border-b-2 pb-4">
                <ChatIcon
                  src={
                    chatUserIcons.find((item) => item.uid === chat.uid)?.url ??
                    "/user.png"
                  }
                />
                <div className="mx-2 min-w-0 flex-1">
                  <div>
                    <span className="font-bold">{chat.name}</span>{" "}
                    <span className="text-sm text-slate-400">
                      {chat.createdAt?.toLocaleString()}
                    </span>
                  </div>
                  <div className="break-words">{chat.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
