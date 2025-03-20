import { requireAdmin } from "@/lib/auth-utils"
import { AdminSettingsContent } from "@/components/admin/admin-settings-content"

export default async function AdminSettingsPage() {
  // This will redirect if not an admin
  const user = await requireAdmin()

  return <AdminSettingsContent user={user} />
}

