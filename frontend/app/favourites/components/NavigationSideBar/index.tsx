"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./component.module.css";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData } from "@/app/lib/railwayApi";

function NavigationSideBar({ params }: { params?: { format: string } }) {
  const [currParams, setCurrParams] = useState("");
  const [counts, setCounts] = useState<{ all: number; anime: number; manga: number; movie: number }>();
  const { user, loading } = useAuth();

  useEffect(() => {
    setCurrParams(params?.format || "");
  }, [params?.format]);

  useEffect(() => {
    let active = true;
    if (loading || !user) {
      setCounts(undefined);
      return;
    }
    getAccountData().then((data) => {
      if (!active) return;
      const bookmarks = data.bookmarks || [];
      setCounts({
        all: bookmarks.length,
        anime: bookmarks.filter((media: any) => media.format === "TV").length,
        manga: bookmarks.filter((media: any) => media.format === "MANGA").length,
        movie: bookmarks.filter((media: any) => media.format === "MOVIE").length,
      });
    }).catch(() => { if (active) setCounts(undefined); });
    return () => { active = false; };
  }, [user, loading]);

  return (
    <>
      <p>FORMAT</p>
      <nav id={styles.nav_container}>
        <ul>
          <li data-active={currParams === ""}><Link href="/favourites">All {counts && <span>({counts.all})</span>}</Link></li>
          <li data-active={currParams === "tv"}><Link href="?format=tv">Animes {counts && <span>({counts.anime})</span>}</Link></li>
          <li data-active={currParams === "manga"}><Link href="?format=manga">Mangas {counts && <span>({counts.manga})</span>}</Link></li>
          <li data-active={currParams === "movie"}><Link href="?format=movie">Movies {counts && <span>({counts.movie})</span>}</Link></li>
        </ul>
      </nav>
    </>
  );
}
export default NavigationSideBar;
