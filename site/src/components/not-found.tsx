import { Link } from "@tanstack/react-router";
import { useSearchContext } from "fumadocs-ui/contexts/search";

export function NotFoundPage() {
  const { setOpenSearch } = useSearchContext();
  return (
    <main id="main-content" className="not-found content-width">
      <p className="mono muted">404</p>
      <h1>Page not found</h1>
      <p>This page may have moved. Search the documentation or return to the homepage.</p>
      <div className="actions">
        <button className="button primary" onClick={() => setOpenSearch(true)}>
          Search documentation
        </button>
        <Link className="button secondary" to="/">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
