import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(() => setSent(false), 1500);
    setEmail("");
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold">Invite Members</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Invite teammates to collaborate in FlowSpace.
        </p>

        <form onSubmit={handleSend} className="mt-6 space-y-4">
          <div className="relative rounded-xl p-[1.5px] bg-gradient-to-r from-indigo-500 to-violet-600">
            <div className="rounded-lg bg-white/90 dark:bg-white/5 p-4">
              <label className="block text-sm font-medium">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="mt-2 w-full rounded-md border border-white/20 px-3 py-2 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
            >
              {sent ? "Sent" : "Send Invite"}
            </Button>
            <Button variant="outline" className="rounded-full">
              Copy Invite Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
