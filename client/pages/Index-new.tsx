import { Link } from "react-router-dom";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import IndexPreview from "@/components/visuals/IndexPreview";
import { CheckCircle, Zap, Users, Lock, Sparkles, ArrowRight } from "lucide-react";

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingBackground />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Real-time Collaboration</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
                FlowSpace
              </span>
              <br />
              <span className="text-foreground">
                Work together,
                <br />
                achieve more.
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              A sleek, real-time collaborative workspace combining visual Kanban boards 
              with powerful note-taking. Modern design, smooth effects, and intuitive UX 
              for teams that move fast.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/board"
                className="group inline-flex items-center gap-2 rounded-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/boards"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur hover:bg-white/80 dark:hover:bg-white/20 transition-all"
              >
                Explore Boards
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full"></div>
            <IndexPreview />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              stay organized
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed for modern teams who value speed, simplicity, and collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Real-time Sync"
            description="See changes instantly as your team collaborates. No refresh needed—everything updates in real-time with WebSocket technology."
            gradient="from-yellow-500 to-orange-500"
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Team Collaboration"
            description="Work together seamlessly with live cursors, presence indicators, and instant notifications when teammates make changes."
            gradient="from-indigo-500 to-violet-500"
          />
          <FeatureCard
            icon={<CheckCircle className="h-6 w-6" />}
            title="Visual Kanban"
            description="Drag and drop tasks across customizable columns. Celebrate wins with confetti when tasks reach Done!"
            gradient="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6" />}
            title="Secure & Private"
            description="Your data is encrypted and secure. Role-based permissions ensure the right people have the right access."
            gradient="from-rose-500 to-pink-500"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Beautiful Design"
            description="Glassmorphic UI with smooth animations and micro-interactions. Dark mode included for late-night productivity."
            gradient="from-purple-500 to-fuchsia-500"
          />
          <FeatureCard
            icon={<ArrowRight className="h-6 w-6" />}
            title="Markdown Notes"
            description="Rich text editing with live markdown preview. Keep all your documentation in sync with your boards."
            gradient="from-cyan-500 to-blue-500"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 border border-white/20 backdrop-blur p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                10ms
              </div>
              <div className="mt-2 text-muted-foreground">Real-time latency</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                100%
              </div>
              <div className="mt-2 text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-pink-500">
                ∞
              </div>
              <div className="mt-2 text-muted-foreground">Boards & cards</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to transform your workflow?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join teams who are already using FlowSpace to ship faster and collaborate better.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link
              to="/board"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/boards"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur hover:bg-white/80 dark:hover:bg-white/20 transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <div className="text-xs text-muted-foreground">
          Built with ❤️ at Mernify Hackathon
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative rounded-2xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10 hover:shadow-xl transition-all hover:scale-105 hover:border-white/50 dark:hover:border-white/20">
      <div
        className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
