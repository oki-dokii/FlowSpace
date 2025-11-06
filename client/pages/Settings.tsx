import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@radix-ui/react-switch";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage account preferences and workspace behavior.
            </p>
          </div>
          <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
            Save Changes
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          <section className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Get notified about activity in your workspace.
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={(v) => setNotifications(!!v)}
              className="w-11 h-6 bg-muted rounded-full relative shadow-inner"
            />
          </section>

          <section className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <div>
              <h3 className="font-medium">Compact Layout</h3>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for dense views.
              </p>
            </div>
            <Switch
              checked={compactMode}
              onCheckedChange={(v) => setCompactMode(!!v)}
              className="w-11 h-6 bg-muted rounded-full relative shadow-inner"
            />
          </section>

          <section className="p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <h3 className="font-medium">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Account removal and data export.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button variant="destructive" className="rounded-full">
                Delete Account
              </Button>
              <Button variant="outline" className="rounded-full">
                Export Data
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
