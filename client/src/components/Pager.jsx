export default function Pager({ page, pages, setPage }) {
  if (!pages || pages < 2) return null;
  return <nav className="pager"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav>;
}
