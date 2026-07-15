# Da Mimì — Web · Guía rápida

## Ver la web en tu ordenador
Doble clic en `index.html` (funciona sin servidor), o para verla con servidor local:

```
node tools/serve.js
```
y abre http://localhost:8765/

## Subirla a Hostinger (o cualquier hosting estático)
1. Entra en el panel de Hostinger → Administrador de archivos → carpeta `public_html`.
2. Arrastra **todo el contenido** de esta carpeta (`index.html`, `styles.css`, `main.js`, `.htaccess`, `lib/`, `assets/`).
3. Listo. El archivo `.htaccess` ya está configurado para que las actualizaciones futuras no se queden cacheadas.

> La carpeta `tools/` y `assets/photos/source/` son de desarrollo: puedes no subirlas.

## Cuando cambies algo en el futuro
En `index.html`, busca `?v=20260715` (aparece 2 veces) y cambia la fecha por la del día del cambio. Así los navegadores de tus clientes descargan siempre la versión nueva.

## Fotos
Las fotos actuales son las publicaciones reales de Instagram (@damimipizzeria) a 640 px.
Para un acabado aún mejor, sustitúyelas por los originales a mayor resolución en
`assets/img/` (mismos nombres de archivo). Nombres usados:

- `pizza-alessia.jpg`, `masa-48h.jpg`, `pizzaiolo-horno.jpg` (portada)
- `douglas.jpg`, `pasta-fresca.jpg`, `terraza.jpg` (nosotros)
- `provolone.jpg`, `gnocchi.jpg`, `cannolo.jpg`, `pasta-cremosa.jpg` (instagram)

## Datos que conviene revisar
- **Horarios** (sección Visítanos y datos SEO en `index.html`): los tomé de
  RestaurantGuru — confírmalos.
- **Logo**: la web recrea el rótulo "da mimì" con la fuente Pacifico. Si prefieres
  el logotipo original exacto, guárdalo como `assets/img/logo.svg` (o .png) y te lo integro.
