import { Link } from 'react-router-dom';
import { setTitle } from '../utils/format';
export default function NotFound() { setTitle('Page not found'); return <div className="container empty"><h1>404</h1><p>We couldn't find that page.</p><Link className="btn btn-primary" to="/">Back to home</Link></div>; }
