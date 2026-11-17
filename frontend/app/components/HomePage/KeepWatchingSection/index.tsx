"use client";
import React, { useEffect, useState } from "react";
import SwiperCarouselContainer from "../../SwiperCarouselContainer";
import styles from "./component.module.css";
import { AnimatePresence, motion } from "framer-motion";
import KeepWatchingEpisodeInfo from "./components/KeepWatchingEpisodeInfo";
import { SwiperSlide } from "swiper/react";
import { KeepWatchingMediaData } from "@/app/ts/interfaces/firestoreData";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData } from "@/app/lib/railwayApi";
export default function KeepWatchingSection() {
 const {user}=useAuth();const [list,setList]=useState<KeepWatchingMediaData[]>([]);
 useEffect(()=>{if(user)getAccountData().then(d=>{const raw=d.keepWatching||{};setList((Array.isArray(raw)?raw:Object.values(raw)).filter(Boolean) as KeepWatchingMediaData[]);}).catch(()=>setList([]));else setList([]);},[user]);
 return <AnimatePresence initial={false}>{!!user&&list.length>0&&<motion.section id={styles.keep_watching_container} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}><h2>Keep Watching</h2><div><SwiperCarouselContainer options={{slidesPerView:2.2,bp480:2.2,bp740:3.2,bp1275:4.2}}>{list.map(media=><SwiperSlide key={media.id} className="custom_swiper_list_item" role="listitem"><KeepWatchingEpisodeInfo animeInfo={media} darkMode deleteFromListHook={()=>setList(current=>current.filter(item=>item.id!==media.id))}/></SwiperSlide>)}</SwiperCarouselContainer></div></motion.section>}</AnimatePresence>;
}
