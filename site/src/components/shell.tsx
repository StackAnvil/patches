import { Link } from "@tanstack/react-router";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useTheme } from "fumadocs-ui/provider/base";
import { ArrowDownToLine, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { site } from "../lib/site";

function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <path className="mark-slab" d="M7 9h50v10H7z" />
        <path className="mark-slab" d="M12 23h45v10H12z" />
        <path className="mark-slab" d="M17 37h40v10H17z" />
        <path className="mark-base" d="M7 51h50v7H7z" />
      </svg>
      StackAnvil
    </span>
  );
}

const navigation = [
  { label: "Play guide", slug: "getting-started" },
  { label: "Developers", slug: "build-from-source" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link to="/$slug/" params={{ slug: navigation[0].slug }} onClick={onNavigate}>
        {navigation[0].label}
      </Link>
      <Link to="/releases/" onClick={onNavigate}>
        Downloads
      </Link>
      <Link to="/$slug/" params={{ slug: navigation[1].slug }} onClick={onNavigate}>
        {navigation[1].label}
      </Link>
    </>
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
        <Link
          to="/"
          aria-label="StackAnvil home"
          onClick={() => {
            setMenuOpen(false);
          }}
        >
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLinks />
        </nav>
        <div className="header-tools">
          <button
            type="button"
            className="search-trigger"
            onClick={() => {
              setOpenSearch(true);
            }}
            aria-label="Search documentation"
          >
            <Search size={17} aria-hidden="true" />
            <span>Search docs</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button
            type="button"
            className="icon-button theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          >
            <Sun className="theme-sun" size={19} aria-hidden="true" />
            <Moon className="theme-moon" size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button mobile-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link
            className="button forge header-download"
            to="/releases/"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <ArrowDownToLine size={17} aria-hidden="true" />
            <span className="header-download-label">Download</span>
          </Link>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <NavLinks
            onNavigate={() => {
              setMenuOpen(false);
            }}
          />
          <a
            href={site.discord}
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            Discord
          </a>
          <a
            href={site.github}
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell-width">
        <div className="footer-brand">
          <Brand />
          <p>Play Bedrock servers from Minecraft Java Edition.</p>
        </div>
        <nav aria-label="Players">
          <h2>Play</h2>
          <Link to="/releases/">Downloads</Link>
          <Link to="/$slug/" params={{ slug: "getting-started" }}>
            Play guide
          </Link>
          <a href={site.coverage}>Known gaps</a>
        </nav>
        <nav aria-label="Developers">
          <h2>Develop</h2>
          <Link to="/$slug/" params={{ slug: "build-from-source" }}>
            Build from source
          </Link>
          <Link to="/$slug/" params={{ slug: "libraries" }}>
            Maven and Javadocs
          </Link>
          <Link to="/$slug/" params={{ slug: "contributing" }}>
            Contribute
          </Link>
        </nav>
        <nav aria-label="Community links">
          <h2>Community</h2>
          <a href={site.discord}>Discord</a>
          <a href={site.github}>GitHub</a>
          <a href={site.curseforge}>CurseForge</a>
        </nav>
        <p className="footer-note">
          StackAnvil is not affiliated with ViaVersion, Mojang, or Microsoft. Upstream projects keep
          their own licenses and copyright notices.
        </p>
      </div>
    </footer>
  );
}
