import type { ReactNode } from 'react';

export default function TarjetaDato({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 8px 25px rgba(0,0,0,0.09)' }}>
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}