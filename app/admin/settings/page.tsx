// app/admin/settings/page.tsx

// Import the ZoomIn component
import { ZoomIn } from "@/components/animations/zoom-in"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <ZoomIn delay={100}>
        <div>
          {/* First settings section */}
          <h2 className="text-lg font-semibold">General Settings</h2>
          <p className="text-sm text-gray-500">Manage general settings for your application.</p>
        </div>
      </ZoomIn>
      <ZoomIn delay={150}>
        <div>
          {/* Second settings section */}
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-gray-500">Manage user accounts and permissions.</p>
        </div>
      </ZoomIn>
      <ZoomIn delay={200}>
        <div>
          {/* Third settings section */}
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="text-sm text-gray-500">Customize the look and feel of your application.</p>
        </div>
      </ZoomIn>
    </div>
  )
}

