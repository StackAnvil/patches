import { Link } from "@tanstack/react-router";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useTheme } from "fumadocs-ui/provider/base";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { site } from "../lib/site";

export function Brand() {
  return (
    <span className="brand">
      <img src="/assets/images/mark.svg" width="28" height="28" alt="" />
      StackAnvil
    </span>
  );
}

export function SiteHeader() {
  const { setOpenSearch } = useSearchContext();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="header-inner">
        <Link to="/" aria-label="StackAnvil home" onClick={() => setMenuOpen(false)}>
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link to="/$slug/" params={{ slug: "getting-started" }}>
            Play guide
          </Link>
          <Link to="/releases/">Downloads</Link>
          <Link to="/$slug/" params={{ slug: "build-from-source" }}>
            Developers
          </Link>
        </nav>
        <div className="header-tools">
          <button
            className="search-trigger"
            onClick={() => setOpenSearch(true)}
            aria-label="Search documentation"
          >
            <Search size={17} />
            <span>Search docs…</span>
            <kbd>⌘ K</kbd>
          </button>
          <button
            className="icon-button theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="dark-icon" size={18} />
            <Moon className="light-icon" size={18} />
          </button>
          <button
            className="icon-button mobile-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
          onClick={() => setMenuOpen(false)}
        >
          <Link to="/$slug/" params={{ slug: "getting-started" }}>
            Play guide
          </Link>
          <Link to="/releases/">Downloads</Link>
          <Link to="/$slug/" params={{ slug: "build-from-source" }}>
            Developers
          </Link>
          <a href={site.github}>GitHub</a>
          <a href={site.discord}>Discord</a>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Brand />
        <p>Independent builds. Changes shared upstream.</p>
      </div>
      <nav aria-label="Community links">
        <a href={site.github}>GitHub</a>
        <a href={site.discord}>Discord</a>
        <a href={site.curseforge}>CurseForge</a>
      </nav>
      <p className="footer-note">
        StackAnvil is independent of ViaVersion. Upstream projects keep their own licenses and
        copyright notices.
      </p>
    </footer>
  );
}
