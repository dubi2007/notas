import Link from 'next/link'
import Image from 'next/image'
import { ZapIcon as Zap, MoonIcon as Moon } from '@/components/icons/NavIcons'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ds-surface)' }}>

      {/* ── Navbar ── */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'var(--ds-primary)' }}
          >
            <Image src="/svg/nueva_nota.svg" alt="logo" width={22} height={22} />
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--ds-on-surface)' }}>
            Apuntes Fáciles
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-75"
            style={{ color: 'var(--ds-on-variant)' }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--ds-primary)' }}
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-16">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-16">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <div
              className="mb-7 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
            >
              <Zap size={11} strokeWidth={2.5} />
              Para estudiantes de ingeniería
            </div>

            <h1
              className="mb-5 text-5xl font-bold leading-[1.13] tracking-tight"
              style={{ color: 'var(--ds-on-surface)' }}
            >
              Tus apuntes,{' '}
              <span style={{ color: 'var(--ds-primary)' }}>organizados</span>
              {' '}y siempre contigo
            </h1>

            <p
              className="mb-9 max-w-md text-lg leading-relaxed"
              style={{ color: 'var(--ds-on-variant)' }}
            >
              Editor enriquecido, carpetas, plantillas y autoguardado.
              Todo lo que necesitas para estudiar mejor.
            </p>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/register"
                className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: 'var(--ds-primary)' }}
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-8 py-3 text-sm font-semibold transition hover:opacity-80"
                style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Right: SVG visual */}
          <div className="relative flex shrink-0 items-center justify-center">
            {/* Main notebook */}
            <div
              className="relative flex h-56 w-56 items-center justify-center rounded-3xl"
              style={{
                background: 'var(--ds-surface-low)',
                border: '1.5px solid rgba(145,180,228,0.2)',
                boxShadow: 'var(--ds-shadow)',
              }}
            >
              <Image src="/svg/nueva_nota.svg" alt="notebook" width={120} height={120} />

              {/* Floating pen badge */}
              <div
                className="absolute -right-5 -top-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'var(--ds-primary)', boxShadow: 'var(--ds-shadow-sm)' }}
              >
                <Image src="/svg/pen1-svgrepo-com.svg" alt="pen" width={32} height={32} />
              </div>

              {/* Floating folders badge */}
              <div
                className="absolute -bottom-5 -left-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'var(--ds-surface-lowest)',
                  border: '1.5px solid rgba(145,180,228,0.25)',
                  boxShadow: 'var(--ds-shadow-sm)',
                }}
              >
                <Image src="/svg/folders.svg" alt="folders" width={32} height={32} />
              </div>

              {/* Floating new-note badge */}
              <div
                className="absolute -bottom-4 -right-8 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: 'var(--ds-secondary-cnt)',
                  boxShadow: 'var(--ds-shadow-sm)',
                }}
              >
                <Image src="/svg/folder-plus-svgrepo-com.svg" alt="new folder" width={26} height={26} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-6 pb-28 pt-4">
        <p
          className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--ds-on-variant)' }}
        >
          Todo lo que necesitas
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-primary)' }}
            >
              <Image src="/svg/pen1-svgrepo-com.svg" alt="editor" width={28} height={28} />
            </div>
            <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
              Editor enriquecido
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-on-variant)' }}>
              Formato, código resaltado, imágenes y tablas en un editor fluido.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-surface-high)' }}
            >
              <Image src="/svg/folders.svg" alt="folders" width={28} height={28} />
            </div>
            <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
              Carpetas y subcarpetas
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-on-variant)' }}>
              Jerarquía clara para organizar tus materias. Cada carpeta con su propia URL.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-primary)' }}
            >
              <Image src="/svg/nueva_nota.svg" alt="plantillas" width={28} height={28} />
            </div>
            <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
              Plantillas
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-on-variant)' }}>
              Crea plantillas reutilizables para tus tipos de apuntes más frecuentes.
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-secondary-cnt)' }}
            >
              <Image src="/svg/folder-plus-svgrepo-com.svg" alt="nueva nota" width={28} height={28} />
            </div>
            <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
              Autoguardado
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-on-variant)' }}>
              Tus cambios se guardan automáticamente. Nunca pierdas una idea.
            </p>
          </div>
        </div>

        {/* Extra feature row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className="flex items-center gap-5 rounded-2xl px-6 py-5"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-secondary-cnt)' }}
            >
              <Moon size={22} style={{ color: 'var(--ds-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--ds-on-surface)' }}>Modo oscuro</h3>
              <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
                Diseñado para largas jornadas de estudio.
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-5 rounded-2xl px-6 py-5"
            style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.14)' }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'var(--ds-secondary-cnt)' }}
            >
              <Zap size={22} style={{ color: 'var(--ds-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--ds-on-surface)' }}>Búsqueda instantánea</h3>
              <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
                Encuentra cualquier nota en segundos desde el panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section
        className="mx-auto mb-20 max-w-2xl rounded-3xl px-10 py-14 text-center"
        style={{
          background: 'var(--ds-surface-low)',
          border: '1px solid rgba(145,180,228,0.14)',
        }}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl"
             style={{ background: 'var(--ds-primary)' }}>
          <Image src="/svg/nueva_nota.svg" alt="nota" width={36} height={36} />
        </div>
        <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--ds-on-surface)' }}>
          ¿Listo para organizar tus estudios?
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          Crea tu cuenta gratis y empieza a tomar apuntes en segundos.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-xl px-10 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--ds-primary)' }}
        >
          Crear cuenta gratis
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-6 py-6 text-center text-xs"
        style={{ borderColor: 'rgba(145,180,228,0.12)', color: 'var(--ds-on-variant)' }}
      >
        © {new Date().getFullYear()} Apuntes Fáciles · Hecho para estudiantes de ingeniería
      </footer>
    </div>
  )
}
