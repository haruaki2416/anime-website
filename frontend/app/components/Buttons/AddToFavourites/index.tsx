"use client";
import React, { useEffect, useState } from "react";
import styles from "./component.module.css";
import LoadingSvg from "@/public/assets/ripple-1s-200px.svg";
import FavouriteSvg from "@/public/assets/heart.svg";
import FavouriteFillSvg from "@/public/assets/heart-fill.svg";
import { MediaData } from "@/app/ts/interfaces/anilistMediaData";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData } from "@/app/lib/railwayApi";
import { updateUserFavouriteMedias } from "@/app/lib/user/userDocUpdateOptions";

export function Button({ mediaInfo, children, svgOnlyColor, isActiveOnAnilist, customText }: {
  mediaInfo: any; children?: React.ReactNode[]; svgOnlyColor?: string; isActiveOnAnilist?: boolean; customText?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [wasAddedToFavourites, setWasAddedToFavourites] = useState(!!isActiveOnAnilist);
  const { user, loading } = useAuth();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!user || loading) return;
    getAccountData().then((data) => setWasAddedToFavourites((data.bookmarks || []).some((item: any) => item.id === mediaInfo.id))).catch(() => {});
  }, [user, loading, mediaInfo.id]);
  async function toggle() {
    if (!user) { dispatch(toggleShowLoginModalValue()); return; }
    setIsLoading(true);
    const mediaData = { id: mediaInfo.id, title: { romaji: typeof mediaInfo.title === "string" ? mediaInfo.title : mediaInfo.title?.romaji, userPreferred: typeof mediaInfo.title === "string" ? mediaInfo.title : mediaInfo.title?.userPreferred }, format: mediaInfo.format || mediaInfo.type, description: mediaInfo.description, coverImage: { extraLarge: mediaInfo.coverImage?.extraLarge, large: mediaInfo.coverImage?.large } };
    try { await updateUserFavouriteMedias({ mediaData, isAddAction: !wasAddedToFavourites }); setWasAddedToFavourites(!wasAddedToFavourites); }
    finally { setIsLoading(false); }
  }
  return <motion.button whileTap={{ scale: 0.9 }} id={styles.container} className={children ? styles.custom_text : ""} onClick={toggle} disabled={isLoading} data-added={wasAddedToFavourites} data-unique-color={svgOnlyColor != undefined} aria-label={wasAddedToFavourites ? "Remove from favourites" : "Add to favourites"}>
    {isLoading ? <LoadingSvg width={16} height={16} /> : wasAddedToFavourites ? (children ? children[1] : <><FavouriteFillSvg width={16} height={16} fill={svgOnlyColor || "var(--brand-color)"} /> FAVOURITED</>) : (children ? children[0] : <><FavouriteSvg width={16} height={16} fill={svgOnlyColor || "var(--white-100)"} /> FAVOURITE</>)}
  </motion.button>;
}


export function SvgIcon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true">{children}</span>;
}
