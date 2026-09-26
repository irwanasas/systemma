import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  authorName: string;
};

export const listAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await getAdminClient()
    .from("announcements")
    .select("id, title, body, published_at, users!inner(full_name)")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data.map(({ id, title, body, published_at, users }) => ({
    id,
    title,
    body,
    publishedAt: published_at,
    authorName: users.full_name,
  }));
};
