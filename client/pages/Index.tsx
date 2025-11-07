import React from "react";
import { Link } from "react-router-dom";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import IndexPreview from "@/components/visuals/IndexPreview";
import { CheckCircle, Zap, Users, Lock, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingBackground />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Real-time Collaboration</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              <motion.span
                className="inline-block"
                style={{
                  background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                FlowSpace
              </motion.span>
              <br />
              <motion.span
                className="text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Work together,
                <br />
                achieve more.
              </motion.span>
            </h1>
            
            <motion.p
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              A sleek, real-time collaborative workspace combining visual Kanban boards 
              with powerful note-taking. Modern design, smooth effects, and intuitive UX 
              for teams that move fast.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Link to="/login">
                <motion.button
                  className="group inline-flex items-center gap-2 rounded-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Sign In / Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/boards">
                <motion.button
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Explore Boards
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
            <IndexPreview />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              stay organized
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed for modern teams who value speed, simplicity, and collaboration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Real-time Sync"
            description="See changes instantly as your team collaborates. No refresh needed—everything updates in real-time with WebSocket technology."
            gradient="from-yellow-500 to-orange-500"
            delay={0}
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Team Collaboration"
            description="Work together seamlessly with live cursors, presence indicators, and instant notifications when teammates make changes."
            gradient="from-indigo-500 to-violet-500"
            delay={0.1}
          />
          <FeatureCard
            icon={<CheckCircle className="h-6 w-6" />}
            title="Visual Kanban"
            description="Drag and drop tasks across customizable columns. Celebrate wins with confetti when tasks reach Done!"
            gradient="from-emerald-500 to-teal-500"
            delay={0.2}
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6" />}
            title="Secure & Private"
            description="Your data is encrypted and secure. Role-based permissions ensure the right people have the right access."
            gradient="from-rose-500 to-pink-500"
            delay={0.3}
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Beautiful Design"
            description="Glassmorphic UI with smooth animations and micro-interactions. Dark mode included for late-night productivity."
            gradient="from-purple-500 to-fuchsia-500"
            delay={0.4}
          />
          <FeatureCard
            icon={<ArrowRight className="h-6 w-6" />}
            title="Markdown Notes"
            description="Rich text editing with live markdown preview. Keep all your documentation in sync with your boards."
            gradient="from-cyan-500 to-blue-500"
            delay={0.5}
          />
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="container mx-auto px-6 py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 border border-white/20 backdrop-blur p-12"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                10ms
              </div>
              <div className="mt-2 text-muted-foreground">Real-time latency</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                100%
              </div>
              <div className="mt-2 text-muted-foreground">Uptime SLA</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-pink-500">
                ∞
              </div>
              <div className="mt-2 text-muted-foreground">Boards & cards</div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="container mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to transform your workflow?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join teams who are already using FlowSpace to ship faster and collaborate better.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link to="/board">
              <motion.button
                className="group inline-flex items-center gap-2 rounded-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/boards">
              <motion.button
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

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
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      className="group relative rounded-2xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <div className="relative" style={{ transform: "translateZ(20px)" }}>
        <motion.div
          className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
