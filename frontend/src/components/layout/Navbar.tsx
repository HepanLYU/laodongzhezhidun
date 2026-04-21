import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: '首页', path: '/' },
  { label: 'AI法律咨询', path: '/consult' },
  { label: '法律知识库', path: '/knowledge' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm"
      style={{ padding: '0 var(--spacing-lg)' }}
    >
      <div className="container flex items-center justify-between" style={{ height: '64px' }}>
        {/* Brand */}
        <Link to="/" className="flex items-center cursor-pointer" style={{ gap: 'var(--spacing-xs)' }}>
          <div
            className="flex items-center justify-center rounded-lg bg-primary"
            style={{ width: '36px', height: '36px' }}
          >
            <Shield className="text-primary-foreground" style={{ width: '20px', height: '20px' }} />
          </div>
          <span
            className="text-foreground"
            style={{ fontSize: 'var(--font-size-title)', fontWeight: 'var(--font-weight-bold)' }}
          >
            劳动者之盾
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          {navLinks.map(link => {
            const active = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`cursor-pointer transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  transition: 'color var(--duration-fast) var(--ease-default)',
                }}
              >
                {link.label}
              </Link>
            )
          })}
          <Link to="/consult">
            <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
              免费咨询
            </Button>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden cursor-pointer text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-border bg-card"
          style={{ padding: 'var(--spacing-md)' }}
        >
          <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
            {navLinks.map(link => {
              const active = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`cursor-pointer rounded-lg transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-body)',
                    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link to="/consult" onClick={() => setMobileOpen(false)}>
              <Button className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                免费咨询
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
