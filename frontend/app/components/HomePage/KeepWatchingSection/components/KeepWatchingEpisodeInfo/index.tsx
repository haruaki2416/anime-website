"use client";
import React,{useState} from "react";
import styles from "./component.module.css";
import Link from "next/link";
import Image from "next/image";
import MediaFormatIcon from "../../../../DynamicAssets/MediaFormatIcon";
import DeleteSvg from "@/public/assets/trash.svg";
import { AnimatePresence,motion } from "framer-motion";
import fallbackImg from "@/public/photo-placeholder.jpg";
import { KeepWatchingMediaData } from "@/app/ts/interfaces/firestoreData";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData,patchAccountData } from "@/app/lib/railwayApi";
export default function KeepWatchingEpisodeInfo({animeInfo,darkMode,deleteFromListHook}:{animeInfo:KeepWatchingMediaData;deleteFromListHook:()=>void;darkMode?:boolean}){
 const [deleted,setDeleted]=useState(false);const {user}=useAuth();
 async function remove(){if(!user)return;const d=await getAccountData();const raw=d.keepWatching||{};if(Array.isArray(raw))await patchAccountData({keepWatching:raw.filter((item:any)=>item.id!==animeInfo.id)});else{const next={...raw};delete next[animeInfo.id];await patchAccountData({keepWatching:next});}setDeleted(true);setTimeout(deleteFromListHook,250);}
 return <AnimatePresence>{!deleted&&<motion.div className={`${styles.media_item_container} ${darkMode?styles.darkMode:""}`} exit={{opacity:0,scale:0}}><div id={styles.img_container}><Image title={animeInfo.title?.romaji||"Anime"} src={animeInfo.episodeImg||fallbackImg} placeholder="blur" blurDataURL="https://upload.wikimedia.org/wikipedia/commons/8/8d/ERR0R_NO_IMAGE_FOUND.jpg" alt={animeInfo.title?.romaji||"Anime"} fill sizes="180px"/><span className={styles.media_type_icon}><MediaFormatIcon format={animeInfo.format}/><span className={styles.media_format_title}>{animeInfo.format}</span></span><div className={styles.overlay_info_container}><Link href={`/media/${animeInfo.id}`}>VIEW DETAILS</Link></div></div><div className={styles.info_bottom}><Link href={`/media/${animeInfo.id}`}>{animeInfo.title?.romaji}</Link><button onClick={remove} title="Remove from list"><DeleteSvg width={16} height={16}/></button></div></motion.div>}</AnimatePresence>;
}
