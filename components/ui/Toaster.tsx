'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={15} style={{ color: '#4ade80' }} />,
  error: <XCircle size={15} style={{ color: '#f87171' }} />,
  info: <Info size={15} style={{ color: '#9ca3af' }} />,
};

export function Toaster() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              pointerEvents: 'all',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: '#1d1f24',
              border: '1px solid #2a2d35',
              borderRadius: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              maxWidth: 320,
              minWidth: 220,
            }}
          >
            {icons[t.type]}
            <span style={{ fontSize: 13, color: '#f5f5f5', flex: 1, lineHeight: 1.4 }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: 2, borderRadius: 4, display: 'flex',
              }}
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
