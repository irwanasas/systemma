import { ActionForm } from "@/components/ui/action-form";
import { createAnnouncement, deleteAnnouncement } from "@/features/announcements/server/actions";
import { listAnnouncements } from "@/features/announcements/server/queries";
import { requireActiveUser } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const AnnouncementsPage = async (): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const announcements = await listAnnouncements();
  const isAdmin = user.role === "admin";

  return (
    <main>
      <h1>Pengumuman</h1>
      {isAdmin && (
        <section aria-labelledby="new-announcement-heading">
          <h2 id="new-announcement-heading">Tulis pengumuman</h2>
          <ActionForm action={createAnnouncement} submitLabel="Terbitkan" pendingLabel="Menerbitkan…">
            <div>
              <label htmlFor="title">Judul</label>
              <input id="title" name="title" maxLength={120} required />
            </div>
            <div>
              <label htmlFor="body">Isi</label>
              <textarea id="body" name="body" maxLength={5000} required />
            </div>
          </ActionForm>
        </section>
      )}
      {announcements.length === 0 ? (
        <p>Belum ada pengumuman.</p>
      ) : (
        announcements.map(({ id, title, body, publishedAt, authorName }) => (
          <article key={id} aria-labelledby={`announcement-${id}`}>
            <h2 id={`announcement-${id}`}>{title}</h2>
            <p>
              {formatDateTime(publishedAt)} · {authorName}
            </p>
            {body.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {isAdmin && (
              <ActionForm
                action={deleteAnnouncement}
                submitLabel={`Hapus pengumuman ${title}`} tone="danger"
                pendingLabel="Menghapus…"
                confirmMessage={`Hapus pengumuman “${title}”?`}
              >
                <input type="hidden" name="id" value={id} />
              </ActionForm>
            )}
          </article>
        ))
      )}
    </main>
  );
};

export default AnnouncementsPage;
