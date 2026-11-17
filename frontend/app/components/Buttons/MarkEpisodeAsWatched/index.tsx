"use client";
import React, { useState } from "react";
import CheckSvg from "@/public/assets/check-circle.svg";
import CheckFillSvg from "@/public/assets/check-circle-fill.svg";
import styles from "./component.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { getAccountData, patchAccountData } from "@/app/lib/railwayApi";
type Props = { episodeNumber: number; episodeTitle: string; mediaId: number; maxEpisodesNumber?: number; showAdditionalText?: boolean; wasWatched?: boolean };
export default function MarkEpisodeAsWatchedButton({ episodeNumber, episodeTitle, mediaId, wasWatched }: Props) {
 const { user } = useAuth(); const dispatch = useAppDispatch(); const [watched,setWatched]=useState(!!wasWatched); const [busy,setBusy]=useState(false);
 async function toggle(){ if(!user){dispatch(toggleShowLoginModalValue());return;} setBusy(true); try {const d=await getAccountData(); const all={...(d.episodesWatched||{})}; const entries=Array.isArray(all[mediaId])?all[mediaId]:[]; const item={mediaId,episodeNumber,episodeTitle}; all[mediaId]=watched?entries.filter((x:any)=>x.episodeNumber!==episodeNumber):[...entries.filter((x:any)=>x.episodeNumber!==episodeNumber),item]; await patchAccountData({episodesWatched:all}); setWatched(!watched);} finally{setBusy(false);} }
 return <div className={styles.button_container}><motion.button onClick={toggle} disabled={busy} data-active={watched} title={watched?"Mark as unwatched":"Mark as watched"}>{watched?<CheckFillSvg width={16} height={16}/>:<CheckSvg width={16} height={16}/>}</motion.button><AnimatePresence>{watched&&<motion.span className={styles.text_span} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Watched</motion.span>}</AnimatePresence></div>;
}
