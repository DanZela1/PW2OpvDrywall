import { Link } from 'react-router-dom';
import facebook from '../../../assets/facebook.png';
import tiktok from '../../../assets/tiktok.png';
import gmail from '../../../assets/gmail.png';

// Equivale a partials/footer.hbs. Usa las clases footer-links y social de styles/_footer.less.
// /terminos todavía no tiene pantalla: mientras tanto muestra "Página no encontrada".
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-links">
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/terminos">Política de privacidad</Link>
          <a href="mailto:opvdrywall@gmail.com">Contacto</a>
        </div>

        <div className="social">
          <a href="https://www.facebook.com/share/1DHx5wUqkY/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook OPV Drywall">
            <img src={facebook} alt="Facebook" className="icon" />
          </a>
          <a href="https://www.tiktok.com/@opv.drywall" target="_blank" rel="noreferrer" aria-label="TikTok OPV Drywall">
            <img src={tiktok} alt="TikTok" className="icon" />
          </a>
          <a href="mailto:opvdrywall@gmail.com" aria-label="Correo OPV Drywall">
            <img src={gmail} alt="Gmail" className="icon" />
          </a>
        </div>

        <p style={{ marginTop: 40, fontSize: '0.95rem', opacity: 0.9 }}>
          © 2021 - 2025 OPV Drywall | Fundada el 8 de marzo de 2021<br />
          Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}