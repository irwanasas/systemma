import Link from "next/link";
import { Key, Megaphone, SignOut, Trash, UserCircle } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { createAnnouncement, deleteAnnouncement } from "@/features/announcements/server/actions";
import { listAnnouncements } from "@/features/announcements/server/queries";
import { logout } from "@/features/auth/server/actions";
import { requireActiveUser } from "@/lib/auth/require-role";

const AnnouncementsPage = async (): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const announcements = await listAnnouncements();
  const isAdmin = user.role === "admin";

  const list =
    announcements.length === 0 ? (
      <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Info PO dan jadwal batch akan muncul di sini." />
    ) : (
      <ul className="flex flex-col gap-4">
        {announcements.map(({ id, title, body, publishedAt, authorName }) => (
          <li key={id}>
            <article
              aria-labelledby={`announcement-${id}`}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 id={`announcement-${id}`} className="text-base sm:text-lg">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <DateTime value={publishedAt} /> · {authorName}
                  </p>
                </div>
                {isAdmin && (
                  <ActionForm
                    action={deleteAnnouncement}
                    submitLabel={`Hapus pengumuman ${title}`}
                    tone="ghost"
                    hideLabel
                    icon={<Trash aria-hidden="true" className="size-5" />}
                    buttonClassName="size-10 text-muted-foreground hover:text-danger"
                    pendingLabel="Menghapus…"
                    confirmTitle="Hapus pengumuman?"
                    confirmMessage={`Hapus pengumuman “${title}”? Agen tidak akan melihatnya lagi.`}
                  >
                    <input type="hidden" name="id" value={id} />
                  </ActionForm>
                )}
              </div>
              <div className="flex flex-col gap-2 text-ui">
                {body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ul>
    );

  if (isAdmin) {
    return (
      <main>
        <h1>Pengumuman</h1>
        <SectionCard id="new-announcement-heading" title="Tulis pengumuman" className="max-w-3xl">
          <ActionForm action={createAnnouncement} submitLabel="Terbitkan" pendingLabel="Menerbitkan…">
            <div>
              <label htmlFor="title">Judul</label>
              <input id="title" name="title" maxLength={120} required className="!max-w-none" />
            </div>
            <div>
              <label htmlFor="body">Isi</label>
              <textarea id="body" name="body" maxLength={5000} required className="!max-w-none" />
            </div>
          </ActionForm>
        </SectionCard>
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="text-base">Diterbitkan</h2>
          {list}
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Info</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="announcements-heading" className="flex flex-col gap-3">
          <h2 id="announcements-heading" className="text-base">
            Pengumuman
          </h2>
          {list}
        </section>
        <SectionCard id="account-heading" title="Akun" className="lg:sticky lg:top-24">
          <p className="flex items-center gap-3">
            <UserCircle aria-hidden="true" className="size-10 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{user.fullName}</span>
              <span className="truncate text-sm text-muted-foreground">{user.username}</span>
            </span>
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="min-h-11 justify-start text-ui">
              <Link href="/change-password" className="text-foreground no-underline hover:no-underline">
                <Key aria-hidden="true" />
                Ganti password
              </Link>
            </Button>
            <form action={logout} className="!items-stretch">
              <Button type="submit" variant="ghost" className="min-h-11 justify-start text-ui text-danger hover:bg-danger-soft hover:text-danger">
                <SignOut aria-hidden="true" />
                Keluar
              </Button>
            </form>
          </div>
        </SectionCard>
      </div>
    </main>
  );
};

export default AnnouncementsPage;
