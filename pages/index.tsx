import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useMemo } from "react";
import Layout from "../components/layout";
import Hls from "hls.js";
import { getApp } from "firebase/app";
import {
  getAuth,
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
import TwitterIcon from "@mui/icons-material/Twitter";
import ElapsedTime from "../components/elapsed-time";
import ElapsedTimeAbout from "../components/elapsed-time-about";
import { useChats } from "../hooks/use-chats";
import IosShareIcon from "@mui/icons-material/IosShare";
import UserControl from "../components/user-control";
import { getPhotoURL, getDisplayName } from "../utils/firebase/user";

interface HTMLVideoElementWithPip extends HTMLVideoElement {
  webkitPresentationMode: "inline" | "picture-in-picture" | "fullscreen";
}

const Home = () => {
  const source = "https://live.omugi.org/live/index.m3u8";
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hls = useRef<Hls>();

  const app = useMemo(() => getApp(), []);
  const provider = new TwitterAuthProvider();
  const auth = useMemo(() => getAuth(app), [app]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const db = useMemo(() => getFirestore(app), [app]);

  const [chatInput, setChatInput] = useState("");

  const chats = useChats(db);

  const [isMuted, setIsMuted] = useState(true);

  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  type Publish = {
    createdAt: Date;
    status: "liveStarted" | "liveEnded";
  };
  const [publish, setPublish] = useState<Publish>();

  useEffect(() => {
    (async () => {
      if (publish?.status === "liveStarted") {
        // ??????????????????????????????????????????
        while (
          await fetch(source)
            .then((res) => !res.ok)
            .catch(() => true)
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // autoPictureInPicture???Safari PWA???????????????
        videoRef.current?.setAttribute("autoPictureInPicture", "");
        if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          setVideoSrc(source);
        } else if (videoRef.current && Hls.isSupported()) {
          hls.current = new Hls();
          hls.current.loadSource(source);
          hls.current.attachMedia(videoRef.current);
        }
      } else if (publish?.status === "liveEnded") {
        setVideoSrc(undefined);
        hls.current?.destroy();
      }
    })();
  }, [videoRef, publish]);

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) setUser(user);
      setIsAuthLoading(false);
    });
  }, [auth]);

  const chatSubmit = () => {
    if (user !== null && chatInput !== "") {
      addDoc(collection(db, "chats"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        text: chatInput,
        name: getDisplayName(user, "twitter.com"),
        photoURL: getPhotoURL(user, "twitter.com", 200),
      });
      setChatInput("");
    }
  };

  useEffect(() => {
    setIsPipSupported(document.pictureInPictureEnabled);
    videoRef.current?.addEventListener("enterpictureinpicture", () => {
      setIsPipActive(true);
    });
    videoRef.current?.addEventListener("leavepictureinpicture", () => {
      setIsPipActive(false);
    });
    videoRef.current?.addEventListener("webkitpresentationmodechanged", () => {
      setIsPipActive(
        (videoRef.current as HTMLVideoElementWithPip)
          ?.webkitPresentationMode === "picture-in-picture"
      );
    });
  }, [videoSrc]);

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

  return (
    <Layout>
      <Head>
        <title>??????????????????????????????</title>
        <meta property="og:url" content="https://live.ural.ink" />
        <meta property="og:type" content="" />
        <meta property="og:title" content="??????????????????????????????" />
        <meta
          property="og:description"
          content="????????????????????????????????????????????????????????????"
        />
        <meta
          property="og:image"
          content="https://live.ural.ink/thumb-default.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@barley_ural" />
      </Head>
      <div className="h-full min-h-screen w-full">
        <div className="m-2 text-center">??????????????????????????????</div>
        {publish?.status === "liveStarted" && (
          <div className="sticky top-0 z-10 bg-black">
            <video
              src={videoSrc}
              ref={videoRef}
              autoPlay
              muted={isMuted}
              playsInline
              controls
              poster="https://live.omugi.org/img/thumb.png"
              className="mx-auto max-h-[50vh] max-w-full"
              crossOrigin="anonymous"
            ></video>
            {isMuted && (
              <button
                className="absolute left-0 top-0 right-0 bottom-0"
                onClick={() => {
                  setIsMuted(false);
                }}
              >
                <div className="absolute left-0 top-0 m-6 inline-block rounded-lg bg-gray-800 py-3 px-4 text-base text-white">
                  <div className="flex items-center">
                    <VolumeOffRoundedIcon className="mr-2" />
                    ??????????????????
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
        <div className="mx-auto max-w-3xl">
          {publish?.status === "liveStarted" ? (
            <div className="flex items-center justify-between">
              <div className="m-2 flex items-center text-sm text-gray-400">
                <button
                  className="mx-2 text-gray-700"
                  onClick={() => {
                    if (videoRef.current) {
                      const canvas = document.createElement("canvas");
                      canvas.width = videoRef.current.videoWidth;
                      canvas.height = videoRef.current.videoHeight;
                      canvas
                        .getContext("2d")
                        ?.drawImage(
                          videoRef.current,
                          0,
                          0,
                          canvas.width,
                          canvas.height
                        );
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const file = new File([blob], "screenshot.png", {
                            type: "image/png",
                          });
                          if (
                            navigator.canShare &&
                            navigator.canShare({ files: [file] })
                          ) {
                            navigator.share({
                              files: [file],
                              text: `#ural_live\n${window.location.href}`,
                            });
                          }
                        }
                      });
                    }
                  }}
                >
                  <IosShareIcon />
                </button>
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
                    className="text-gray-700"
                    titleAccess="????????????????????????????????????????????????????????????"
                  />
                }
              />
            </div>
          ) : (
            <div className="m-2 text-sm text-gray-400">
              {publish?.status === "liveEnded" ? (
                <>
                  ????????????
                  <ElapsedTimeAbout from={publish.createdAt} />
                  ????????????????????????
                </>
              ) : (
                "Loading..."
              )}
            </div>
          )}
          {user ? (
            <div className="flex items-center p-2">
              <UserControl
                user={user}
                auth={auth}
                onSignOut={() => {
                  setUser(null);
                }}
              />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full rounded-md border-2 border-gray-200 p-1"
                placeholder="?????????????????????"
                enterKeyHint="send"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    chatSubmit();
                  }
                }}
              />
            </div>
          ) : isAuthLoading ? (
            <div className="m-2 text-sm text-gray-400">Loading...</div>
          ) : (
            <button
              onClick={() => {
                setIsAuthLoading(true);
                signInWithPopup(auth, provider).then((result) => {
                  const credintial =
                    result && TwitterAuthProvider.credentialFromResult(result);
                  const token = credintial?.accessToken;
                  const secret = credintial?.secret;
                  const user = result?.user;
                  if (token && secret && user) {
                    setDoc(doc(db, "users", user.uid), {
                      name: getDisplayName(user, "twitter.com"),
                      photoURL: getPhotoURL(user, "twitter.com", 200),
                    });
                    setDoc(doc(db, "users", user.uid, "privates", "twitter"), {
                      token,
                      secret,
                    });
                  }
                });
              }}
              className="m-2 flex items-center rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-600"
            >
              <TwitterIcon className="mr-2" />
              <div>Twitter?????????????????????</div>
            </button>
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
