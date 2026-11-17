import { redirect } from "next/navigation";

export const metadata = {
  title: "Manga information | AniProject",
  description: "View manga details and official reading options.",
};

export default function ReadChapter({ params }: { params: { id: string } }) {
  redirect(`/media/${params.id}`);
}
