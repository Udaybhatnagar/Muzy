'use client';

import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 60,
        background: 'rgba(15,15,16,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2a2d35',
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: '#f5f5f5',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Music2 size={16} color="#0f0f10" strokeWidth={2.5} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#f5f5f5' }}>
          Muzy
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'flex', gap: 8 }}
      >
        <span
          style={{
            fontSize: 12,
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span className="live-dot" />
          Real-time
        </span>
      </motion.div>
    </nav>
  );
}
