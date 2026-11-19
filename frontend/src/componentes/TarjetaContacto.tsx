type Props = {
  href: string;
  icono: string;
  alt: string;
  texto: string;
  accion: string;
  externo?: boolean;
};

export default function TarjetaContacto({ href, icono, alt, texto, accion, externo = false }: Props) {
  return (
    <a href={href} className="contact-card" {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <div>
        <img src={icono} alt={alt} />
        <p>{texto}</p>
        <span>{accion}</span>
      </div>
    </a>
  );
}