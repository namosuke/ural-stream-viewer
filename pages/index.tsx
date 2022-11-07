import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useMemo } from "react";
import Layout from "../components/layout";
import Hls from "hls.js";
import { getApp } from "firebase/app";
import {
  getAuth,
  signOut,
  TwitterAuthProvider,
  User,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import ChatIcon from "../components/chat-icon";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import PictureInPictureIcon from "@mui/icons-material/PictureInPicture";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const Home = () => {
  const source = "https://live.omugi.org/live/output.m3u8";
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      setVideoSrc(source);
    } else if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(videoRef.current);
    }
  }, [videoRef]);

  const app = useMemo(() => getApp(), []);
  const provider = new TwitterAuthProvider();
  const auth = useMemo(() => getAuth(app), [app]);
  const [user, setUser] = useState<User | null>(null);
  const db = useMemo(() => getFirestore(app), [app]);
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
      }
    });
  }, [auth]);

  const [chatInput, setChatInput] = useState("");
  const chatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (user !== null && chatInput !== "") {
      addDoc(collection(db, "chats"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        text: chatInput,
        name: user.displayName,
        photoURL: user.photoURL,
      });
      setChatInput("");
    }
  };
  type Chat = {
    id: string;
    uid: string;
    createdAt?: Date;
    text?: string;
    name?: string;
    photoURL?: string;
  };
  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    onSnapshot(q, (QuerySnapshot) => {
      setChats(
        QuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.data().uid,
          createdAt: doc.data().createdAt?.toDate(),
          text: doc.data().text,
          name: doc.data().name,
          photoURL: doc.data().photoURL,
        }))
      );
    });
  }, [db]);

  const [isMuted, setIsMuted] = useState(true);

  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  useEffect(() => {
    setIsPipSupported(document.pictureInPictureEnabled);
    videoRef.current?.addEventListener("enterpictureinpicture", () => {
      setIsPipActive(true);
    });
    videoRef.current?.addEventListener("leavepictureinpicture", () => {
      setIsPipActive(false);
    });
  }, []);
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
      console.log(err);
    }
  };

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
          content={`https://web.live.omugi.org/img/thumb.png?t=${Date.now()}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@barley_ural" />
      </Head>
      <div className="h-full min-h-screen w-full">
        <div className="m-2 text-center">ウラルのゲームライブ</div>
        <div className="sticky top-0 z-10 bg-black">
          <video
            src={videoSrc}
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
            controls
            className="mx-auto max-h-[50vh] max-w-full"
          ></video>
          {isMuted && (
            <button
              className="absolute right-0 bottom-0 left-0 top-0"
              onClick={() => {
                setIsMuted(false);
              }}
            >
              <div className="m-6 inline-block rounded-lg bg-gray-800 py-4 px-6 text-lg text-white">
                <div className="flex items-center">
                  <VolumeOffRoundedIcon className="mr-2 text-3xl" />
                  タップしてミュート解除
                </div>
              </div>
            </button>
          )}
        </div>
        <div className="flex justify-between">
          {user ? (
            <div>
              <button
                onClick={() => {
                  signOut(auth).then(() => {
                    setUser(null);
                  });
                }}
                className="m-2 rounded bg-red-500 py-1 px-2 font-bold text-white hover:bg-red-600"
              >
                ログアウト
              </button>
              <span>ユーザー名：{user.displayName}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                signInWithPopup(auth, provider).then((result) => {
                  const credintial =
                    result && TwitterAuthProvider.credentialFromResult(result);
                  const token = credintial?.accessToken;
                  const secret = credintial?.secret;
                  const user = result?.user;
                  if (token && secret && user) {
                    setDoc(doc(db, "users", user.uid), {
                      name: user.displayName,
                      photoURL: user.photoURL,
                    });
                    setDoc(doc(db, "users", user.uid, "privates", "twitter"), {
                      token,
                      secret,
                    });
                  }
                });
              }}
              className="m-2 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-600"
            >
              Twitterログインでチャットに参加
            </button>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={isPipSupported && isPipActive}
                onChange={pipClick}
                disabled={!isPipSupported}
              />
            }
            label={
              <PictureInPictureIcon titleAccess="ピクチャ・イン・ピクチャを有効にする" />
            }
          />
        </div>
        <div className="mx-auto max-w-3xl">
          {user && (
            <form onSubmit={chatSubmit}>
              <div className="p-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full rounded-md border-2 border-gray-200 p-1"
                  placeholder="チャットを入力"
                  enterKeyHint="send"
                />
              </div>
            </form>
          )}
          <div>
            {chats.map((chat) => (
              <div key={chat.id} className="m-4 flex border-b-2 pb-4">
                <ChatIcon src={chat.photoURL ?? "/user.png"} />
                <div className="mx-2 flex-1">
                  <div>
                    <span className="font-bold">{chat.name}</span>{" "}
                    <span className="text-sm text-gray-400">
                      {chat.createdAt?.toLocaleString()}
                    </span>
                  </div>
                  <div>{chat.text}</div>
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
