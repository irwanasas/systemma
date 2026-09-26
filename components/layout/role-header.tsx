import { AppHeader } from "@/components/layout/app-header";
import { navLinksByRole } from "@/components/layout/nav-links";
import type { CurrentUser } from "@/features/auth/types";
import { countUnreadNotifications } from "@/features/notifications/server/queries";

export const RoleHeader = async ({ user }: { user: CurrentUser }): Promise<React.ReactNode> => {
  const unreadCount = user.role === "admin" ? await countUnreadNotifications(user.id) : 0;
  return <AppHeader fullName={user.fullName} links={navLinksByRole[user.role]} unreadCount={unreadCount} />;
};
