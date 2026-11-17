"use client";
import * as AddToFavourites from "@/app/components/Buttons/AddToFavourites";
import { userMediaStatusEntries } from "@/app/lib/dataConstants/anilist";
import FavouriteSvgFill from "@/public/assets/heart-fill.svg";
import FavouriteSvg from "@/public/assets/heart.svg";
import CheckFillSvg from "@/public/assets/check-circle-fill.svg";
import XSvg from "@/public/assets/x.svg";
import CheckSvg from "@/public/assets/check-circle.svg";
import styles from "./component.module.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData, patchAccountData } from "@/app/lib/railwayApi";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";

export default function OptionsPanel({isPanelOpen,setIsPanelOpen,isFavourite,mediaTitle,mediaInfo,toggleLoginModalVisibility}:{
 isPanelOpen:boolean;setIsPanelOpen:React.Dispatch<React.SetStateAction<boolean>>;isFavourite:boolean|undefined;
 mediaListEntryInfo:any;mediaTitle:any;mediaInfo:any;toggleLoginModalVisibility:()=>void;amountWatchedOrRead?:number;
}){
 const {user}=useAuth();const dispatch=useAppDispatch();const [busy,setBusy]=useState(false);const [status,setStatus]=useState<string|null>(null);
 useEffect(()=>{if(user)getAccountData().then(d=>{for(const entry of userMediaStatusEntries){if((d.mediaListSavedByStatus?.[entry.value.toLowerCase()]||[]).some((m:any)=>m.id===mediaInfo.id)){setStatus(entry.value);break;}}}).catch(()=>{});},[user,mediaInfo.id]);
 async function choose(next:string){if(!user){toggleLoginModalVisibility();dispatch(toggleShowLoginModalValue());return;}setBusy(true);try{const d=await getAccountData();const lists={...(d.mediaListSavedByStatus||{})};for(const key of Object.keys(lists))lists[key]=(lists[key]||[]).filter((m:any)=>m.id!==mediaInfo.id);if(status!==next){const key=next.toLowerCase();lists[key]=[...(lists[key]||[]),{id:mediaInfo.id,title:mediaInfo.title,format:mediaInfo.format,description:mediaInfo.description,coverImage:mediaInfo.coverImage}];setStatus(next);}else setStatus(null);await patchAccountData({mediaListSavedByStatus:lists});}finally{setBusy(false);}}
 if(!isPanelOpen)return null;
 return <motion.div className={styles.options_panel_overlay} onClick={()=>setIsPanelOpen(false)} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:30}}>
  <motion.div className={styles.options_panel} onClick={e=>e.stopPropagation()}>
   <div className={styles.panel_heading}><h5>{mediaTitle?.userPreferred||mediaTitle?.romaji||"Options"}</h5><motion.button onClick={()=>setIsPanelOpen(false)} whileTap={{scale:.9}} aria-label="Close menu"><XSvg/></motion.button></div>
   <ul><li><AddToFavourites.Button isActiveOnAnilist={isFavourite} mediaInfo={mediaInfo}><AddToFavourites.SvgIcon><FavouriteSvg fill="var(--brand-color)"/></AddToFavourites.SvgIcon><AddToFavourites.SvgIcon><FavouriteSvgFill fill="var(--brand-color)"/></AddToFavourites.SvgIcon></AddToFavourites.Button></li>
   {userMediaStatusEntries.map(entry=><li key={entry.value}><motion.button data-active={status===entry.value} disabled={busy} onClick={()=>choose(entry.value)} whileTap={{scale:.9}}>{status===entry.value?<><CheckFillSvg/> Set as {entry.name}</>:<><CheckSvg/> Set as {entry.name}</>}</motion.button></li>)}</ul>
  </motion.div>
 </motion.div>;
}
