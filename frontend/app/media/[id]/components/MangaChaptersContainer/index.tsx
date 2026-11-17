"use client";
import React from "react";
import styles from "./component.module.css";
import { MediaDataFullInfo } from "@/app/ts/interfaces/anilistMediaData";

export default function MangaChaptersContainer({ mediaInfo }: {
  mediaInfo: MediaDataFullInfo;
  chaptersReadOnAnilist?: number;
}) {
  return (
    <div id={styles.container}>
      <h2>Reading options</h2>
      <p>
        AniProject provides manga discovery and library tracking, but does not host chapter scans.
        Please use an authorized reading service available in your region.
      </p>
    </div>
  );
}
