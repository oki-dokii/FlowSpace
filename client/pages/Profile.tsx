import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Settings as SettingsIcon, User } from "lucide-react";

export default function Profile() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://i.pravatar.cc/120?img=12" />
            <AvatarFallback>SO</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Soham</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Product Designer • San Francisco
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                  </Button>
                </Link>
                <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                  Edit Profile
                </Button>
              </div>
            </div>

            <p className="mt-4 text-sm">
              I design delightful interfaces and ship collaborative products.
              Lover of simple UX and delightful micro-interactions.
            </p>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> <span>soham@example.com</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" /> <span>Member since 2024</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium">Teams</h3>
              <div className="mt-2 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/80 dark:bg-white/7 border border-white/20">
                  <img
                    src="https://i.pravatar.cc/32?img=3"
                    className="h-6 w-6 rounded-full"
                  />{" "}
                  Product
                </div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/80 dark:bg-white/7 border border-white/20">
                  <img
                    src="https://i.pravatar.cc/32?img=21"
                    className="h-6 w-6 rounded-full"
                  />{" "}
                  Design
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/20 pt-4">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Moved “Design landing hero” to In Progress • 2m ago</li>
            <li>Commented on shared notes • 10m ago</li>
            <li>Invited Mia to Product team • 1h ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
