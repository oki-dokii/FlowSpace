import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Moon,
  SunMedium,
  LogOut,
  Settings,
  User2,
  Users,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function FlowHeader() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const tabs = [
    { to: "/boards", label: "Boards", icon: LayoutGrid },
    { to: "/teams", label: "Teams", icon: Users },
    { to: "/activity", label: "Activity", icon: SunMedium },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-black/40 supports-[backdrop-filter]:bg-white/40 border-b border-white/20 dark:border-white/10">
      <div className="container mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-inner shadow-indigo-200/40" />
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
              FlowSpace
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-full p-1 bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-sm">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
                    isActive || location.pathname.startsWith(to)
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow"
                      : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/invite" className="hidden sm:inline-flex">
              <span className="relative inline-flex items-center gap-2 rounded-full p-[1.5px] bg-gradient-to-r from-indigo-500 to-violet-600">
                <span className="rounded-full px-4 py-2 bg-white/70 dark:bg-white/10 backdrop-blur border border-white/30 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/15 transition">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Invite Members
                  </span>
                </span>
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <SunMedium className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-0.5 bg-white/60 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:bg-white/80 transition shadow">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src="https://i.pravatar.cc/100?img=12"
                      alt="Soham"
                    />
                    <AvatarFallback>SO</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://i.pravatar.cc/100?img=12" />
                    <AvatarFallback>SO</AvatarFallback>
                  </Avatar>
                  Soham
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User2 className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
