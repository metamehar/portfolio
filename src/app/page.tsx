import { redirect } from 'next/navigation'

// The FAISAL portfolio site is served as static HTML/CSS/JS from the
// `public/` directory. Visiting `/` redirects to `/index.html` so the
// user lands on the FAISAL homepage, and internal nav (About, Portfolio,
// Blog, Contact) works through normal static-file serving.
export default function Home() {
  redirect('/index.html')
}
