import { Auth, User, signInAnonymously } from "firebase/auth";
import { useEffect } from "react";

/** 自動ログイン */
export const useAutoLogin = (
  auth: Auth,
  callback: (user: User | null) => void
) => {
  useEffect(() => {
    signInAnonymously(auth);
    auth.onAuthStateChanged(callback);
  }, [auth, callback]);
};
