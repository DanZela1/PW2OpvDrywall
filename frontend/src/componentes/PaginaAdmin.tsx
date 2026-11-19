import type { ReactNode } from 'react';

export default function PaginaAdmin({ titulo, ancho = 1200, children }: { titulo: string; ancho?: number; children: ReactNode }) {
  return (
    <main style={{ background: '#fff' }}>
      <section style={{ padding: '40px 20px', maxWidth: ancho, margin: '0 auto' }}>
        <h2>{titulo}</h2>
        {children}
      </section>
    </main>
  );
}