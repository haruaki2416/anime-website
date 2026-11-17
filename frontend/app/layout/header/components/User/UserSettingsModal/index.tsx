"use client";
import React, { FormEvent, MouseEventHandler, useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./component.module.css";
import CloseSvg from "@/public/assets/x.svg";
import { useAuth } from "@/app/lib/auth/AuthProvider";

export default function UserSettingsModal({ onClick }: { onClick?: MouseEventHandler<HTMLDivElement> | MouseEventHandler<HTMLButtonElement> | (() => void) }) {
  const { user, updateData, deleteAccount } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({ displayName: user?.displayName || "", mediaTitlePreferredLang: "romaji", videoSubtitleLanguage: "English", videoQuality: "auto", autoNextEpisode: true, autoSkipIntroAndOutro: false, showAdultContent: false });
  useEffect(() => { if (user?.data) setSettings((current) => ({ ...current, ...user.data, displayName: user.displayName || current.displayName })); }, [user]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setMessage("");
    try { await updateData(settings); setMessage("Settings saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings."); } finally { setSaving(false); }
  }
  return <motion.div id={styles.backdrop} onClick={onClick as MouseEventHandler<HTMLDivElement>} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <motion.div id={styles.modal} onClick={(e) => e.stopPropagation()} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className={styles.settings_heading}><h2>Account settings</h2><button id={styles.close_menu_btn} onClick={onClick as MouseEventHandler<HTMLButtonElement>}><CloseSvg width={16} height={16} /></button></div>
      <form onSubmit={save}>
        <div className={styles.group_container}><h5>Profile</h5><label>Username<input value={settings.displayName} maxLength={40} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} /></label></div>
        <div className={styles.group_container}><h5>Preferences</h5>
          <label>Preferred title language<select value={settings.mediaTitlePreferredLang} onChange={(e) => setSettings({ ...settings, mediaTitlePreferredLang: e.target.value })}><option value="romaji">Romaji</option><option value="english">English</option><option value="native">Native</option></select></label>
          <label>Subtitle language<input value={settings.videoSubtitleLanguage} onChange={(e) => setSettings({ ...settings, videoSubtitleLanguage: e.target.value })} /></label>
          <label>Video quality<select value={settings.videoQuality} onChange={(e) => setSettings({ ...settings, videoQuality: e.target.value })}><option value="auto">Auto</option><option value="1080p">1080p</option><option value="720p">720p</option></select></label>
          <label><input type="checkbox" checked={settings.autoNextEpisode} onChange={(e) => setSettings({ ...settings, autoNextEpisode: e.target.checked })} /> Auto next episode</label>
          <label><input type="checkbox" checked={settings.autoSkipIntroAndOutro} onChange={(e) => setSettings({ ...settings, autoSkipIntroAndOutro: e.target.checked })} /> Skip intro/outro (where supported)</label>
          <label><input type="checkbox" checked={settings.showAdultContent} onChange={(e) => setSettings({ ...settings, showAdultContent: e.target.checked })} /> Show mature titles</label>
        </div>
        <div className={styles.btns_container}><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button><p role="status">{message}</p></div>
      </form>
      <div style={{ padding: 24 }}><button type="button" onClick={async () => { if (window.confirm("Delete your account and all saved data? This cannot be undone.")) { await deleteAccount(); (onClick as (() => void) | undefined)?.(); } }}>Delete account</button></div>
    </motion.div>
  </motion.div>;
}
