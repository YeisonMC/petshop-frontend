# PetShop - capa de presentación

Frontend de TB1 con Vite y React. La aplicación se alojará en vm-petshop-web y
consumirá las APIs de vm-petshop-app; esta última se conecta a vm-petshop-db.

## Organización de src

- assets: imágenes y otros recursos importados por React.
- components/ui: piezas visuales reutilizables, sin lógica de negocio.
- components/common: navegación, pie de página y otros elementos compartidos.
- features/auth: autenticación y perfil del cliente.
- features/products: catálogo, consulta de productos, componentes y hooks.
- features/cart: carrito de compras.
- features/checkout: reservado para el flujo futuro de compra.
- hooks: hooks compartidos entre distintos módulos.
- layouts: estructuras comunes de las páginas.
- pages: pantallas completas de inicio y cuenta.
- routes: configuración de las rutas actuales.
- services: cliente HTTP compartido para la API.
- store: estado global si llega a ser necesario.
- utils: funciones puras reutilizables.

Cada feature mantiene sus componentes, hooks y peticiones específicos cerca de
su propia lógica. Solo las carpetas que todavía están vacías conservan `.gitkeep`.

AppRouter define las rutas `/` y `/cuenta`. El Home consulta categorías y
productos de la API con TanStack Query. El buscador y los filtros de categoría
utilizan parámetros de URL. El detalle de producto consulta las variantes
antes de agregar al carrito; el carrito requiere una sesión `CLIENTE_WEB`.

La API se consume desde `/api`. En desarrollo, Vite la redirige al backend
HTTPS. Al publicar el `dist` con Nginx, se debe configurar el mismo proxy
`/api` en el servidor web. Las imágenes de categorías y del hero son recursos
ilustrativos; los nombres, precios, ofertas y existencias provienen del
backend. Las URL de `cdn.petshopdemo.pe` son datos de prueba que no resuelven,
por lo que se muestra "Imagen no disponible" hasta que se registren imágenes
reales.

## Comandos

Desde la carpeta del proyecto:

    npm ci
    npm run dev
    npm run format
    npm run format:check
    npm run lint
    npm run build

El servidor de desarrollo de Vite no es el despliegue final. Más adelante
Nginx podrá servir el directorio dist generado por npm run build y enrutar
las solicitudes /api hacia la capa de aplicación por la red privada. El
navegador del usuario no puede acceder directamente a la IP privada de Azure.
