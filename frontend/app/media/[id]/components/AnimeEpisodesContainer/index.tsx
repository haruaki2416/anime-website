"use client";
import React from "react";
import styles from "./component.module.css";
import { MediaData, MediaDataFullInfo } from "@/app/ts/interfaces/anilistMediaData";

export default function EpisodesContainer({ mediaInfo }: {
  imdb?: { mediaSeasons?: any; episodesList?: any[] };
  mediaInfo: MediaData | MediaDataFullInfo;
  crunchyrollInitialEpisodes?: any[];
  episodesWatchedOnAnilist?: number;
}) {
  return (
    <div id={styles.container}>
      <h2>Where to watch</h2>
      <p>
        AniProject is an anime discovery and personal-library site. Episode playback is not hosted here.
        Please use an authorized viewing service available in your region.
      </p>
    </div>
  );
}
