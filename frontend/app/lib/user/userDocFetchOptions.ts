import { getAccountData } from "@/app/lib/railwayApi";
export async function getUserAdultContentPreference(_userId?: string) {
  const data = await getAccountData();
  return Boolean(data.showAdultContent);
}
