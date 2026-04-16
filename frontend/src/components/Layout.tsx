import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-primary text-white shadow-brand"
      : "text-slate-600 hover:bg-cyan-50 hover:text-primary"
  }`;

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const seekerLinks = (
    <>
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/find-referrers" className={linkClass}>
        Find Referrers
      </NavLink>
      <NavLink to="/my-requests" className={linkClass}>
        My Requests
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </>
  );

  const referrerLinks = (
    <>
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/rewards" className={linkClass}>
        Rewards
      </NavLink>
      <NavLink to="/incoming-requests" className={linkClass}>
        Incoming Requests
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </>
  );

  const roleLinks =
    user?.role === "SEEKER" ? seekerLinks : user?.role === "REFERRER" ? referrerLinks : adminLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center">
          <div className="h-10 md:h-12">
            <img
              src="/images/Referrly-Logo.png"
              alt="Referrly"
              className="h-full w-auto object-contain"
            />
          </div>
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-2 lg:flex">{roleLinks}</nav>
            <div className="hidden items-center gap-3 lg:flex">
              <NotificationBell />
              {user.role === "REFERRER" ? (
                <div className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                  {user.referallyCoins} coins
                </div>
              ) : null}
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <nav className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link to="/register" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-[#0f69b5]">
              Create account
            </Link>
          </nav>
        )}

        <button
          onClick={() => setIsMenuOpen((current) => !current)}
          className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                {roleLinks}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.role === "REFERRER" ? (
                      <div className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                        {user.referallyCoins} coins
                      </div>
                    ) : null}
                    <NotificationBell />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                  Login
                </Link>
                <Link to="/register" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export const Footer = () => (
  <footer className="mt-16 border-t border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <p>Referrly helps job seekers ask well, referrers respond clearly, and admins stay informed.</p>
      <p>Built with React, Node, Prisma, and PostgreSQL.</p>
    </div>
  </footer>
);
