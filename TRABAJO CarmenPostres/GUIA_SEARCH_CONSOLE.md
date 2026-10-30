# Guía breve: verificar el sitio en Google Search Console y enviar el sitemap

## 1. Verificación de propiedad
1. Entra a https://search.google.com/search-console y agrega la propiedad con tu dominio (https://[TU_DOMINIO]).
2. Elige el método de verificación que prefieras:
   - Etiqueta HTML: Google te dará una meta etiqueta `<meta name="google-site-verification" content="...">`. El proyecto ya incluye una en `index.html` y `Recopilacion_de_datos.html` (content="U_EyLVXK940vu_S6b03vDSzMT4mm-wEIPceVsvPC4Ns"). Si tu código de verificación es distinto, dímelo antes de agregarlo a otros HTML.
   - DNS: agrega el registro TXT en tu proveedor de dominio.
   - Archivo HTML: sube el archivo que Google te proporciona a la raíz del sitio.
3. Pulsa "Verificar".

## 2. Enviar el sitemap
1. En Search Console, ve a "Sitemaps".
2. Ingresa la URL: `https://[TU_DOMINIO]/sitemap.xml` y envía.
3. Revisa el estado: debe quedar "Correcto" sin errores.

## 3. Notas
- Reemplaza `[TU_DOMINIO]` en `sitemap.xml` y `robots.txt` por tu dominio real antes de publicar.
- `pago.html` tiene `<meta name="robots" content="noindex, nofollow">` para que no se indexe.
- `admin.html` tiene `<meta name="robots" content="noindex, nofollow">` y no se incluye en el sitemap.
- El archivo duplicado `Recopilacion de datos.html` (con espacio) no está en el sitemap; considera eliminarlo para evitar contenido duplicado.
- Enlaces rotos detectados: `nosotros.html` footer apunta a `recetas.html` (no existe) y `libro.html` footer apunta a `libro-reclamaciones.html` (no existe). Corrígelos cuando puedas.
