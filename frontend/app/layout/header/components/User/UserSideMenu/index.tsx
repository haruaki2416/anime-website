"use client";
import React, { useState } from "react";
import styles from "./component.module.css";
import PersonIcon from "@/public/assets/person-circle.svg";
import ChevronDownSvg from "@/public/assets/chevron-down.svg";
import ChevronUpSvg from "@/public/assets/chevron-up.svg";
import LogoutSvg from "@/public/assets/logout.svg";
import SettingsSvg from "@/public/assets/gear-fill.svg";
import StarListSvg from "@/public/assets/list-stars.svg";
import FavouriteSvg from "@/public/assets/heart.svg";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import UserSettingsModal from "../UserSettingsModal";
import ShowUpLoginPanelAnimated from "@/app/components/UserLoginModal/animatedVariant";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import { toggleShowLoginModalValue } from "@/app/lib/redux/features/loginModal";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth/AuthProvider";

const framerMotionShowUp = { hidden: { y: "-40px", opacity: 0 }, visible: { y: "0", opacity: 1, transition: { duration: 0.2 } }, exit: { opacity: 0 } };

export default function UserSideMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const loginOpen = useAppSelector((state) => state.ShowLoginModal?.value);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  function closeLogin() {
    const restricted = ["/my-lists", "/favourites"];
    if (!restricted.includes(pathname)) dispatch(toggleShowLoginModalValue());
  }

  return <div id={styles.user_container}>
    <ShowUpLoginPanelAnimated apperanceCondition={!!loginOpen} customOnClickAction={closeLogin} />
    {!user ? <button onClick={() => dispatch(toggleShowLoginModalValue())} className={`display_flex_row align_items_center ${styles.heading_btn}`} id={styles.user_btn} data-useractive={false} data-loading={loading} aria-label="Log in">
      <PersonIcon width={16} height={16} /><span>{loading ? "Loading…" : "Login"}</span>
    </button> : <>
      <button onClick={() => setMenuOpen(!menuOpen)} className={`display_flex_row align_items_center ${styles.heading_btn} ${menuOpen ? styles.active : ""}`} id={styles.user_btn} data-useractive={true}>
        <span id={styles.img_container}><Image src={user.photoURL || "/profile_fallback.jpg"} alt={user.displayName || "User"} fill sizes="32px" /></span>
        <span>{menuOpen ? <ChevronUpSvg /> : <ChevronDownSvg />}</span>
      </button>
      <AnimatePresence initial={false} mode="wait">
        {menuOpen && <motion.div variants={framerMotionShowUp} id={styles.user_menu_list} initial="hidden" animate="visible" exit="exit"><ul role="menu">
          <li role="menuitem" onClick={() => setMenuOpen(false)}><Link href="/favourites"><FavouriteSvg width={16} height={16} /> Favourites</Link></li>
          <li role="menuitem" onClick={() => setMenuOpen(false)}><Link href="/my-lists"><StarListSvg width={16} height={16} /> My Lists</Link></li>
          <li role="menuitem"><button onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}><SettingsSvg width={16} height={16} /> Settings</button></li>
          <li role="menuitem"><button onClick={async () => { await logout(); setMenuOpen(false); }}><LogoutSvg width={16} height={16} /> Log Out</button></li>
        </ul></motion.div>}
        {settingsOpen && <UserSettingsModal onClick={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </>}
  </div>;
}
