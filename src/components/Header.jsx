import { NavLink } from "react-router-dom";

export default function Header() {
  const navClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-green-500 text-slate-950"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-xl font-bold text-green-400"
        >
          🐍 Adaptive Python
        </NavLink>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2">

          <NavLink to="/" className={navClass}>
            🏠 Home
          </NavLink>

          <NavLink to="/learning" className={navClass}>
            📖 Learning
          </NavLink>

          <NavLink to="/practice" className={navClass}>
            📚 Practice
          </NavLink>

          <NavLink to="/challenge" className={navClass}>
            🧪 Challenge
          </NavLink>

          <NavLink to="/playground" className={navClass}>
            💻 Playground
          </NavLink>

        </nav>
      </div>
    </header>
  );
}