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
type Props={chapterNumber:number;chapterTitle:string;mediaId:number;showAdditionalText?:boolean;wasChapterReadOnAnilist?:boolean;maxChaptersNumber?:number};
export default function MarkChapterAsReadButton({chapterNumber,chapterTitle,mediaId,wasChapterReadOnAnilist}:Props){
 const {user}=useAuth();const dispatch=useAppDispatch();const [read,setRead]=useState(!!wasChapterReadOnAnilist);const [busy,setBusy]=useState(false);
 async function toggle(){if(!user){dispatch(toggleShowLoginModalValue());return;}setBusy(true);try{const d=await getAccountData();const all={...(d.chaptersRead||{})};const entries=Array.isArray(all[mediaId])?all[mediaId]:[];all[mediaId]=read?entries.filter((x:any)=>x.chapterNumber!==chapterNumber):[...entries.filter((x:any)=>x.chapterNumber!==chapterNumber),{mediaId,chapterNumber,chapterTitle}];await patchAccountData({chaptersRead:all});setRead(!read);}finally{setBusy(false);}}
 return <div className={styles.button_container}><motion.button onClick={toggle} data-active={read} disabled={busy} title={read?"Mark as unread":"Mark as read"}>{read?<CheckFillSvg width={16} height={16}/>:<CheckSvg width={16} height={16}/>}</motion.button><AnimatePresence>{read&&<motion.span className={styles.text_span} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Read</motion.span>}</AnimatePresence></div>;
}
