import { defineConfig } from 'vite'
import purgecss from 'vite-plugin-purgecss'
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
  base: '/PW2OpvDrywall/',

  build: {
    cssMinify: true,
    rollupOptions: {
      input: {
        main:                 'index.html',
        acercaDe:             'html/acercaDe.html',
        contactenos:          'html/contactenos.html',
        formRegistro:         'html/formRegistro.html',
        galeria:              'html/galeria.html',
        nuestrosProgramas:    'html/nuestrosProgramas.html',
        porqueOpv:            'html/porqueOpv.html',
        preguntasFrecuentes:  'html/preguntasFrecuentes.html',
        terminosYcondiciones: 'html/terminosYcondiciones.html',
        testimonios:          'html/testimonios.html',
      }
    }
  },

  plugins: [
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
})