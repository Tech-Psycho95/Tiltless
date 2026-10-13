"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getShortAddress } from "@/lib/auth";
import { TiltlessLogo } from "./TiltlessLogo";

const links = [
  ["problem", "Problem"],
  ["how-it-works", "How it works"],
  ["findings", "Checks"],
  ["demo", "Live demo"],
  ["faq", "FAQ"],
];

export function SiteNav() {
  const [active, setActive] = useState("problem");
  const [stuck, setStuck] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isAuthenticated, user, login, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    router.push('/login');
  };

  useEffect(() => {
    const sections = links.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.4, 0.8] },
    );
    sections.forEach((section) => observer.observe(section));
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const getUserDisplay = () => {
    if (!user) return '';
    if (user.email?.address) return user.email.address;
    if (user.wallet?.address) return getShortAddress(user.wallet.address);
    if (user.google?.email) return user.google.email;
    return 'User';
  };

  const getFullUserDisplay = () => {
    if (!user) return '';
    if (user.email?.address) return user.email.address;
    if (user.wallet?.address) return user.wallet.address;
    if (user.google?.email) return user.google.email;
    return 'User';
  };

  return (
    <>
      <header className="absolute top-0 z-40 w-full">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Three-column grid: left (logo), center (nav), right (actions) */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Left: Logo */}
            <div className="justify-self-start">
              <a href="#top" className="inline-block">
                <TiltlessLogo />
              </a>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden justify-self-center lg:flex lg:items-center lg:gap-8" aria-label="Main navigation">
              {links.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`group relative whitespace-nowrap text-sm transition-colors ${
                    active === id ? "text-brand-mint" : "text-white/50 hover:text-white"
                  }`}
                >
                  {label}
                  {/* Active indicator dot */}
                  {active === id && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-mint" />
                  )}
                  {/* Hover underline */}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right: GitHub + User/Login */}
            <div className="flex min-w-0 items-center justify-end gap-3 justify-self-end sm:gap-4">
              {/* GitHub - hidden on mobile */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hidden text-sm text-white/60 transition-colors hover:text-white md:block"
              >
                GitHub
              </a>

              {/* Mobile Menu Button - visible below lg */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* User Button / Login Button - desktop */}
              {!isAuthenticated ? (
                <button
                  onClick={() => login()}
                  className="hidden rounded-lg bg-brand-mint/10 px-4 py-2 text-sm font-medium text-brand-mint ring-1 ring-brand-mint/20 transition-all hover:bg-brand-mint/20 lg:block"
                >
                  Log in
                </button>
              ) : (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    title={getFullUserDisplay()}
                    className="flex max-w-[200px] items-center gap-2 rounded-lg bg-brand-mint/10 px-4 py-2 text-sm font-medium text-brand-mint ring-1 ring-brand-mint/20 transition-all hover:bg-brand-mint/20"
                  >
                    <span className="truncate">{getUserDisplay()}</span>
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border border-white/10 bg-brand-dark shadow-xl">
                        <div className="border-b border-white/10 px-4 py-3">
                          <div className="truncate text-sm text-white" title={getFullUserDisplay()}>
                            {getFullUserDisplay()}
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="mt-4 rounded-lg border border-white/10 bg-brand-dark/95 p-4 backdrop-blur-xl lg:hidden">
              <nav className="space-y-2" aria-label="Mobile navigation">
                {links.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      active === id
                        ? "bg-brand-mint/10 text-brand-mint"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-4 border-t border-white/10 pt-4">
                {!isAuthenticated ? (
                  <button
                    onClick={() => {
                      login();
                      setShowMobileMenu(false);
                    }}
                    className="w-full rounded-lg bg-brand-mint/10 px-4 py-2 text-sm font-medium text-brand-mint ring-1 ring-brand-mint/20 transition-all hover:bg-brand-mint/20"
                  >
                    Log in
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-md bg-white/5 px-3 py-2">
                      <div className="truncate text-sm text-white" title={getFullUserDisplay()}>
                        {getFullUserDisplay()}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <a
        href="#demo"
        className={`fixed bottom-5 right-5 z-50 rounded-full bg-brand-mint px-5 py-3 text-sm font-semibold text-brand-bg shadow-[0_0_25px_rgba(151,252,228,0.25)] transition-all duration-500 hover:bg-brand-mint/90 ${
          stuck ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        Autopsy a wallet
      </a>
    </>
  );
}
