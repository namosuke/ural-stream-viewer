import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const getIconUrl = async (uid: string) => {
  const storage = getStorage();
  return await getDownloadURL(ref(storage, `/icons/${uid}`)).catch(
    () => undefined
  );
};
