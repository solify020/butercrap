"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface SecuritySettingsProps {
  settings: {
    forceLogout: boolean
    maxLoginAttempts: number
  }
  onChange: (settings: {
    forceLogout: boolean
    maxLoginAttempts: number
  }) => void
}

export function SecuritySettings({ settings, onChange }: SecuritySettingsProps) {
  const handleForceLogoutChange = (checked: boolean) => {
    onChange({
      ...settings,
      forceLogout: checked,
    })
  }

  const handleMaxLoginAttemptsChange = (value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 1) {
      onChange({
        ...settings,
        maxLoginAttempts: numValue,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="force-logout" className="text-base">
              Force Logout
            </Label>
            <p className="text-sm text-gray-500">Force all users to log out and re-authenticate</p>
          </div>
          <Switch id="force-logout" checked={settings.forceLogout} onCheckedChange={handleForceLogoutChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-login-attempts" className="text-base">
          Maximum Login Attempts
        </Label>
        <p className="text-sm text-gray-500">Number of failed login attempts before account is temporarily locked</p>
        <Input
          id="max-login-attempts"
          type="number"
          min={1}
          value={settings.maxLoginAttempts}
          onChange={(e) => handleMaxLoginAttemptsChange(e.target.value)}
        />
      </div>
    </div>
  )
}

