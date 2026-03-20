'use client'

import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@/components/icons/NavIcons'

export default function ProfilePage() {
  const user = useAppStore(s => s.user)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  // Prevenir parpadeo si no hay usuario (esto pasa rápido redirigido pero por si acaso)
  if (!user) return <div className="p-8 text-sm" style={{ color: 'var(--ds-on-variant)' }}>Cargando perfil...</div>

  return (
    <div className="flex h-full flex-col overflow-y-auto" style={{ background: 'var(--ds-surface)' }}>
      {/* ── Header ── */}
      <motion.div 
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex shrink-0 items-center gap-4 px-4 py-4 md:px-8 md:py-5"
        style={{ borderBottom: '1px solid rgba(145,180,228,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/app')}
            className="text-[0.95rem] font-semibold transition hover:opacity-80"
            style={{ color: 'var(--ds-on-variant)' }}
          >
            Mis Documentos
          </button>
          <ChevronRightIcon size={14} style={{ color: 'var(--ds-outline)' }} />
          <span className="text-[1.2rem] font-bold" style={{ color: 'var(--ds-on-surface)' }}>
            Mi Perfil
          </span>
        </div>
      </motion.div>

      {/* ── Contenido Principal ── */}
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 rounded-3xl p-8 mb-8"
          style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.15)', boxShadow: 'var(--ds-shadow-sm)' }}
        >
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg"
               style={{ background: 'linear-gradient(135deg, var(--ds-primary), var(--ds-primary-alt))' }}>
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--ds-on-surface)' }}>
              Detalles de la cuenta
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--ds-on-variant)' }}>
              Gestiona tu información personal y los ajustes de tu sesión.
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-outline)' }}>Correo electrónico</span>
                <p className="text-base font-medium mt-0.5" style={{ color: 'var(--ds-on-surface)' }}>{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
           className="rounded-3xl p-6 md:p-8"
           style={{ background: 'var(--ds-surface-low)', border: '1px solid rgba(145,180,228,0.15)' }}
        >
           <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--ds-on-surface)' }}>Sesión y Seguridad</h2>
           <p className="text-sm mb-6" style={{ color: 'var(--ds-on-variant)' }}>
             Si estás utilizando un dispositivo público, te recomendamos cerrar sesión al terminar.
           </p>

           <div className="flex flex-col sm:flex-row gap-4">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleLogout}
               className="rounded-xl px-6 py-2.5 text-sm font-semibold transition"
               style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
             >
               Cerrar sesión
             </motion.button>
           </div>
        </motion.div>
      </div>
    </div>
  )
}
