import { redirect } from "next/navigation";

export const metadata = {
  title: "Episode information | AniProject",
  description: "View anime details and official viewing options.",
};

export default function WatchEpisode({ params }: { params: { id: string } }) {
  redirect(`/media/${params.id}`);
}
