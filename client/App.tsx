import "./global.css";
import "./animations.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Board from "./pages/Board";
import Boards from "./pages/Boards";
import Teams from "./pages/Teams";
import Activity from "./pages/Activity";
import Invite from "./pages/Invite";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotesEditor from "./pages/NotesEditor";
import Login from "./pages/Login";
import { FlowHeader } from "./components/FlowHeader";
import { FlowFooter } from "./components/FlowFooter";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { BoardProvider } from "./contexts/BoardContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
      <BoardProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background">
                <FlowHeader />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/board" element={<Board />} />
                    <Route path="/boards" element={<Boards />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/activity" element={<Activity />} />
                    <Route path="/dashboard" element={<Placeholder />} />
                    <Route path="/invite" element={<Invite />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/notes-editor" element={<NotesEditor />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <FlowFooter />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </BoardProvider>
    </AuthProvider>
  </ThemeProvider>
);

const container = document.getElementById("root")!;
// Avoid calling createRoot multiple times during HMR
const anyWin = window as any;
if (!anyWin.__root) {
  anyWin.__root = createRoot(container);
}
anyWin.__root.render(<App />);
