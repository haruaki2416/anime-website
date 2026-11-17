"use client";
import React, { useEffect, useState } from "react";
import styles from "./component.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { useAuth } from "@/app/lib/auth/AuthProvider";
import { getAccountData, patchAccountData } from "@/app/lib/railwayApi";
import { userMediaStatusEntries } from "@/app/lib/dataConstants/anilist";

export function Button({ mediaInfo, statusOnAnilist, children }: { mediaInfo: any; statusOnAnilist?: any; listEntryId?: number; imdbEpisodesList?: any[]; amountWatchedOrRead?: number; children?: React.ReactNode[] }) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string | null>(statusOnAnilist || null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user && !statusOnAnilist) getAccountData().then((d) => { const lists = d.mediaListSavedByStatus || {}; for (const item of userMediaStatusEntries) if ((lists[item.value.toLowerCase()] || []).some((m: any) => m.id === mediaInfo.id)) setStatus(item.value); }).catch(() => {}); }, [user, mediaInfo.id, statusOnAnilist]);
  async function choose(next: string) {
    if (!user) { dispatch(toggleShowLoginModalValue()); return; }
    setBusy(true);
    try {
      const data = await getAccountData();
      const lists = { ...(data.mediaListSavedByStatus || {}) };
      for (const key of Object.keys(lists)) lists[key] = (lists[key] || []).filter((item: any) => item.id !== mediaInfo.id);
      if (status !== next) {
        const key = next.toLowerCase();
        lists[key] = [...(lists[key] || []), { id: mediaInfo.id, title: mediaInfo.title, format: mediaInfo.format, description: mediaInfo.description, coverImage: mediaInfo.coverImage }];
        setStatus(next);
      } else setStatus(null);
      await patchAccountData({ mediaListSavedByStatus: lists });
      setOpen(false);
    } finally { setBusy(false); }
  }
  return <div className={styles.container || ""} style={{ position: "relative" }}>
    <button type="button" disabled={busy} onClick={() => user ? setOpen(!open) : dispatch(toggleShowLoginModalValue())}>{children?.[0] || (status ? status.replaceAll("_", " ") : "ADD TO LIST")}</button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", zIndex: 20, background: "var(--white-100)", padding: 8, display: "grid", gap: 6, minWidth: 160 }}>
      {["CURRENT", "PLANNING", "COMPLETED", "PAUSED", "DROPPED"].map((value) => <button key={value} type="button" onClick={() => choose(value)}>{value}{status === value ? " ✓" : ""}</button>)}
    </motion.div>}</AnimatePresence>
  </div>;
}
