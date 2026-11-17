"use client";
import { AnimatePresence } from "framer-motion";
import UserModal from ".";

export default function ShowUpLoginPanelAnimated({
  apperanceCondition,
  customOnClickAction,
}: {
  apperanceCondition: boolean;
  customOnClickAction?: () => void;
  auth?: unknown;
}) {
  return <AnimatePresence initial={false} mode="wait">{apperanceCondition && <UserModal onClick={customOnClickAction as any} />}</AnimatePresence>;
}
