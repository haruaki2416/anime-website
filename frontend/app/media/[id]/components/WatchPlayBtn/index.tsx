"use client";

import React from "react";
import styles from "./component.module.css";
import pageStyles from "../../components/PageHeading/GridInfo/component.module.css";

export default function PlayBtn({
  mediaId,
  mediaTitle,
  mediaFormat,
}: {
  mediaId: number;
  mediaTitle: string;
  mediaFormat: string;
  anilistLastEpisodeWatched?: number;
}) {
  return (
    <li className={`${pageStyles.info_item} ${pageStyles.action_btn}`}>
      <div
        id={styles.container}
        role="status"
        aria-label="Official viewing information"
        title="This catalogue does not host or aggregate video streams"
      >
        <span id={styles.continue_span}>CATALOGUE ONLY</span>
        <span>
          Streaming is not hosted here. Check the anime's official distributor
          for licensed viewing options.
        </span>
      </div>
    </li>
  );
}
