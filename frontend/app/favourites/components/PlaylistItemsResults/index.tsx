"use client";
import React,{useEffect,useState} from "react";
import styles from "./component.module.css";
import { useSearchParams } from "next/navigation";
import * as MediaCard from "@/app/components/MediaCards/MediaCard";
import SvgLoading from "@/public/assets/Eclipse-1s-200px.svg";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData } from "@/app/lib/railwayApi";
export default function PlaylistItemsResults({params}:{params?:{format:string;sort:"title_desc"|"title_asc"}}){
 const {user,loading}=useAuth();const [items,setItems]=useState<any[]>([]);const dispatch=useAppDispatch();const search=useSearchParams();
 useEffect(()=>{if(user)getAccountData().then(d=>setItems(d.bookmarks||[])).catch(()=>setItems([]));else if(!loading)setItems([]);},[user,loading]);
 useEffect(()=>{if(!loading&&!user)dispatch(toggleShowLoginModalValue());},[loading,user]);
 const filtered=items.filter(m=>!params?.format||m.format===params.format.toUpperCase()).sort((a,b)=>{const x=a.title?.userPreferred||a.title?.romaji||"",y=b.title?.userPreferred||b.title?.romaji||"";return params?.sort==="title_desc"?y.localeCompare(x):x.localeCompare(y);});
 return <>{loading?<div style={{height:400,display:"flex"}}><SvgLoading width={120} height={120} style={{margin:"auto"}}/></div>:<div id={styles.container}><ul>{filtered.length===0?<p className={styles.no_results_text}>No Results</p>:filtered.map(media=><li key={media.id}><MediaCard.Container onDarkMode><MediaCard.MediaImgLink hideOptionsButton mediaInfo={media} mediaId={media.id} title={media.title?.userPreferred||media.title?.romaji||"Untitled"} formatOrType={media.format} url={media.coverImage?.extraLarge||media.coverImage?.large}/><MediaCard.LinkTitle title={media.title?.userPreferred||media.title?.romaji||"Untitled"} id={media.id}/></MediaCard.Container></li>)}</ul></div>}</>;
}
