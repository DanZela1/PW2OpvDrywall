import { defineConfig } from 'vite'
import purgecss from 'vite-plugin-purgecss'
import handlebars from 'vite-plugin-handlebars'

// En GitHub Pages el sitio vive en https://USUARIO.github.io/NOMBRE-DEL-REPO/
// El workflow de GitHub Actions entrega GITHUB_REPOSITORY (usuario/repo); en local se usa el nombre por defecto.
// Para otro caso (dominio propio o sitio de usuario) se puede forzar con VITE_BASE=/
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'PW2OpvDrywall'
const baseProduccion = process.env.VITE_BASE ?? `/${repo}/`

// Vite agrega la base a imágenes, CSS y JS, pero NO a los enlaces <a href="/..."> (menú, footer).
// Este plugin se la agrega para que la navegación funcione bajo /NOMBRE-DEL-REPO/
const prefijarEnlaces = (base) => ({
  name: 'prefijar-enlaces-internos',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html.replace(/(<a\b[^>]*\shref=")\/(?!\/)/g, `$1${base}`),
  },
})

export default defineConfig(({ command }) => ({
  base: command === 'build' ? baseProduccion : '/',

  build: {
    cssMinify: true,
    cssCodeSplit: false, // ✅ un solo archivo CSS
    rollupOptions: {
      input: {
        main: 'index.html',
        acercaDe: 'html/acercaDe.html',
        contactenos: 'html/contactenos.html',
        formRegistro: 'html/formRegistro.html',
        galeria: 'html/galeria.html',
        nuestrosProgramas: 'html/nuestrosProgramas.html',
        porqueOpv: 'html/porqueOPV.html',
        preguntasFrecuentes: 'html/preguntasFrecuentes.html',
        terminosYcondiciones: 'html/terminosYcondiciones.html',
        testimonios: 'html/testimonios.html',
      }
    }
  },

  server: {
    port: 5173,
  },

  plugins: [
    prefijarEnlaces(baseProduccion),
    handlebars({
      partialDirectory: './partials',
    }),
    purgecss({
      content: [
        './index.html',
        './html/**/*.html',
        './javascript/**/*.js',
      ],
    }),
  ],
}))