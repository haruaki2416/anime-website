import { getAccountData, patchAccountData } from "@/app/lib/railwayApi";

type UpdateFavourites = { mediaData: any; userId?: string; isAddAction: boolean };
export async function updateUserFavouriteMedias({ mediaData, isAddAction }: UpdateFavourites) {
  const data = await getAccountData();
  const bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
  const next = isAddAction ? [...bookmarks.filter((item) => item.id !== mediaData.id), mediaData] : bookmarks.filter((item) => item.id !== mediaData.id);
  await patchAccountData({ bookmarks: next });
  return true;
}
export async function updateUserMediaListByStatus({ status, mediaData }: { status: string; mediaData: any; userId?: string }) {
  const data = await getAccountData();
  const lists = data.mediaListSavedByStatus || {};
  const key = status.toLowerCase();
  await patchAccountData({ mediaListSavedByStatus: { ...lists, [key]: [...(lists[key] || []).filter((item: any) => item.id !== mediaData.id), mediaData] } });
  return true;
}
export async function removeMediaOnListByStatus({ status, newListFiltered }: { status: string; newListFiltered: any; userId?: string }) {
  const data = await getAccountData();
  await patchAccountData({ mediaListSavedByStatus: { ...(data.mediaListSavedByStatus || {}), [status.toLowerCase()]: newListFiltered } });
  return true;
}
