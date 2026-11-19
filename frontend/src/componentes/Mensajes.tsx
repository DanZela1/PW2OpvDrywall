// Aviso de error (role="alert") y de éxito (role="status") de las pantallas. Si no hay texto, no dibuja nada.
export default function Mensajes({ error, aviso }: { error?: string | null; aviso?: string | null }) {
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {aviso && <p role="status">{aviso}</p>}
    </>
  );
}