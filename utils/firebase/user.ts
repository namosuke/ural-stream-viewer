import { User } from "firebase/auth";

export type ProviderId =
  | "google.com"
  | "facebook.com"
  | "twitter.com"
  | "github.com"
  | "microsoft.com"
  | "yahoo.com"
  | "apple.com";

export const getPhotoURL = (
  user: User,
  providerId: ProviderId,
  size: "original" | 24 | 48 | 73 | 200 | 400
): string | null => {
  const provider = user.providerData.find((p) => p.providerId === providerId);
  if (!provider || !provider.photoURL) return null;
  if (providerId === "twitter.com") {
    if (size === "original") return provider.photoURL.replace("_normal", "");
    if (size === 24) return provider.photoURL.replace("_normal", "_mini");
    if (size === 73) return provider.photoURL.replace("_normal", "_bigger");
    if (size === 200) return provider.photoURL.replace("_normal", "_200x200");
    if (size === 400) return provider.photoURL.replace("_normal", "_400x400");
    return provider.photoURL;
  }
  return provider.photoURL;
};

export const getDisplayName = (
  user: User,
  providerId: ProviderId
): string | null => {
  const provider = user.providerData.find((p) => p.providerId === providerId);
  if (!provider || !provider.displayName) return null;
  return provider.displayName;
};
