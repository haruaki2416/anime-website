"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { AppStore } from "@/app/lib/redux/store";
import { userCustomStore } from "../user/anilistUserLoginOptions";
import { AuthProvider } from "@/app/lib/auth/AuthProvider";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) storeRef.current = userCustomStore;
  return <Provider store={storeRef.current}><AuthProvider>{children}</AuthProvider></Provider>;
}
