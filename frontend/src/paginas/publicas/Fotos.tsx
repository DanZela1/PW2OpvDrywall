import imagen1 from '../../../../assets/imagen1.jpg';
import imagen2 from '../../../../assets/imagen2.jpg';
import imagen3 from '../../../../assets/imagen3.jpg';
import imagen4 from '../../../../assets/imagen4.jpg';
import imagen5 from '../../../../assets/imagen5.jpg';
import imagen6 from '../../../../assets/imagen6.jpg';
import imagen7 from '../../../../assets/imagen7.jpg';
import imagen9 from '../../../../assets/imagen9.jpg';

// Las 8 fotos de galeria.html, en el mismo orden. Si más adelante vienen de la API, solo cambia esta lista
const FOTOS = [
  { src: imagen1, alt: 'Trabajo de OPV Drywall 1' },
  { src: imagen2, alt: 'Trabajo de OPV Drywall 2' },
  { src: imagen3, alt: 'Trabajo de OPV Drywall 3' },
  { src: imagen4, alt: 'Trabajo de OPV Drywall 4' },
  { src: imagen5, alt: 'Trabajo de OPV Drywall 5' },
  { src: imagen6, alt: 'Trabajo de OPV Drywall 6' },
  { src: imagen7, alt: 'Trabajo de OPV Drywall 7' },
  { src: imagen9, alt: 'Trabajo de OPV Drywall 8' },
];

// Las clases (gallery, contener, grids, rows, cols, pic) son las de _galeria.less y _responsive.less
export default function Fotos() {
  return (
    <section className="gallery">
      <div className="contener">
        <div className="grids">
          <div className="rows">
            {FOTOS.map((f) => (
              <div key={f.src} className="cols">
                <div className="pic">
                  <img src={f.src} alt={f.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}