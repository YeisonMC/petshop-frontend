# PetShop - capa de presentación

Frontend de TB1 con Vite y React. La aplicación se alojará en vm-petshop-web y
consumirá las APIs de vm-petshop-app; esta última se conecta a vm-petshop-db.

## Organización de src

- assets: imágenes y otros recursos importados por React.
- components/ui: piezas visuales reutilizables, sin lógica de negocio.
- components/common: navegación, pie de página y otros elementos compartidos.
- features/auth: autenticación y perfil del cliente.
- features/products: catálogo; sus components y hooks quedan preparados.
- features/cart: carrito de compras.
- features/checkout: reservado para el flujo futuro de compra.
- hooks: hooks compartidos entre distintos módulos.
- layouts: estructuras comunes de las páginas.
- pages: pantallas completas; Home es la página inicial.
- routes: configuración de rutas cuando se definan las vistas.
- services: cliente HTTP compartido para la API.
- store: estado global si llega a ser necesario.
- utils: funciones puras reutilizables.

Cada feature debe mantener sus componentes, hooks y peticiones específicos cerca
de su propia lógica. Las carpetas vacías incluyen .gitkeep para que puedan
versionarse cuando se cree el repositorio.

Por ahora App muestra Home directamente. No se añadieron React Router, Axios,
Zustand, Redux ni otras dependencias: AppRouter.jsx, api.js, cartStore.js y los
helpers se crearán cuando exista su comportamiento real.

## Comandos

Desde la carpeta del proyecto:

    npm install
    npm run dev
    npm run lint
    npm run build

El servidor de desarrollo de Vite no es el despliegue final. Más adelante
Nginx podrá servir el directorio dist generado por npm run build y enrutar
las solicitudes /api hacia la capa de aplicación por la red privada. El
navegador del usuario no puede acceder directamente a la IP privada de Azure.
