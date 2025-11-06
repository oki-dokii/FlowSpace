import { Link, useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title =
    pathname.replace("/", "").replace(/\b\w/g, (m) => m.toUpperCase()) ||
    "Dashboard";
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        This section is coming next. Tell me to build it out!
      </p>
      <div className="mt-6">
        <Link
          to="/board"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow hover:shadow-lg"
        >
          Go to Demo Board
        </Link>
      </div>
    </div>
  );
}
