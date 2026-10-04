import { Brand } from './SiteHeader.jsx'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Brand />
        <p>Un espacio para descubrir productos para tus mascotas.</p>
        <small>© {new Date().getFullYear()} Superpet · Proyecto académico</small>
      </div>
    </footer>
  )
}
