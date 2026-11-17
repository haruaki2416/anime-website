"use client";
import React,{useEffect,useState} from "react";
import styles from "./component.module.css";
import * as MediaCard from "@/app/components/MediaCards/MediaCard";
import SvgLoading from "@/public/assets/Eclipse-1s-200px.svg";
import SvgCaretDown from "@/public/assets/chevron-down.svg";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { AnimatePresence,motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData } from "@/app/lib/railwayApi";
type Props={mediaFetched?:any[];params?:{format:string;type:"tv"|"movie"|"manga";sort:"title_desc"|"title_asc"}};
export default function MediasContainer({params}:Props){
 const {user,loading}=useAuth();const [lists,setLists]=useState<{name:string;medias:any[]}[]>([]);const [keep,setKeep]=useState<any[]>([]);const dispatch=useAppDispatch();
 useEffect(()=>{if(user)getAccountData().then(d=>{setLists(Object.entries(d.mediaListSavedByStatus||{}).map(([name,medias])=>({name,medias:medias as any[]})));const raw=d.keepWatching||{};setKeep((Array.isArray(raw)?raw:Object.values(raw)).filter(Boolean));}).catch(()=>{});},[user]);
 useEffect(()=>{if(!loading&&!user)dispatch(toggleShowLoginModalValue());},[loading,user]);
 if(loading)return <div style={{height:300,display:"flex"}}><SvgLoading width={100} height={100} style={{margin:"auto"}}/></div>;
 const renderList=(name:string,medias:any[])=>{const filtered=medias.filter(m=>!params?.format||m.format===params.format.toUpperCase()).sort((a,b)=>{const x=a.title?.romaji||"",y=b.title?.romaji||"";return params?.sort==="title_desc"?y.localeCompare(x):x.localeCompare(y);});return <section className={styles.list_container} key={name}><h2>{name.replaceAll("_"," ").toUpperCase()}</h2><ul>{filtered.length?filtered.map(media=><li key={media.id}><MediaCard.Container onDarkMode><MediaCard.MediaImgLink hideOptionsButton mediaInfo={media} mediaId={media.id} title={media.title?.userPreferred||media.title?.romaji||"Untitled"} formatOrType={media.format} url={media.coverImage?.extraLarge||media.coverImage?.large}/><MediaCard.LinkTitle title={media.title?.userPreferred||media.title?.romaji||"Untitled"} id={media.id}/></MediaCard.Container></li>):<p>No media in this list yet.</p>}</ul></section>};
 return <div id={styles.container}>{(params?.type==null||params?.type==="tv")&&renderList("Keep Watching",keep)}{lists.map(l=>renderList(l.name,l.medias))}</div>;
}
