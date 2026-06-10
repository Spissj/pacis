# Paci's Cakes - Digital Bakery Web Application

Este es el proyecto web completo para **Paci's Cakes Digital Bakery**, desarrollado a partir del diseño de Stitch. La aplicación está construida con **Next.js 14 (App Router)**, **TypeScript**, y **Tailwind CSS v4**.

## Características Principales

1. **Diseño Premium Editorial:** Fiel al diseño de Stitch, utilizando la paleta de colores y las fuentes seleccionadas (`EB Garamond` para cabeceras y `DM Sans` para el cuerpo).
2. **Catálogo Interactivo con Carrito:** Búsqueda y filtrado de productos por categoría con modal de detalles y flujo de compra integrado.
3. **Creador de Tortas Personalizadas (Custom Cake Builder):** Asistente paso a paso para cotizaciones personalizadas de tortas según número de porciones, sabores de bizcocho, rellenos, colores y texto decorativo.
4. **Seguimiento de Pedidos (Tracking):** Página pública para que los clientes consulten el progreso de su pedido mediante un código único (ej. `PC-9531`).
5. **Panel de Administración (Admin Dashboard):**
   - Resumen financiero y métricas clave de pedidos.
   - Lista detallada de pedidos para cambiar estados (Pendiente, Cocina, Listo, Entregado, Cancelado), actualizar precios y agregar notas.
   - Panel de control CRUD para añadir, editar, activar/desactivar y borrar productos del catálogo.

---

## Estructura del Proyecto

* **`src/app/`**: Páginas del sitio (Landing principal `/`, área de tracking `/pedidos/tracking`, y administración `/admin`).
* **`src/components/`**: Componentes reutilizables (`Navbar`, `Footer`, `Catalog`, `CartSidebar` y `CustomCakeBuilder`).
* **`src/context/`**: Proveedor del estado global de la cesta de compras y visibilidad de modales.
* **`src/lib/`**: Lógica de almacenamiento, configuración de Firebase, y datos semilla (`db.ts`, `firebase.ts`, `seed.ts`).

---

## Cómo Ejecutar el Proyecto

### 1. Requisitos Previos
Asegúrate de tener instalado **Node.js** (versión 18 o superior).

### 2. Instalación de Dependencias
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo
Para correr el proyecto localmente:
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 4. Credenciales del Administrador
* **URL del Panel:** `http://localhost:3000/admin`
* **Contraseña de Acceso:** `admin123`

---

## Configuración de Base de Datos Dual

La aplicación cuenta con soporte dual de almacenamiento. **Funciona inmediatamente con LocalStorage** para facilitar la entrega e inspección inmediata.

Para conectar una base de datos de producción con **Firebase Firestore**:

1. Crea un proyecto en la consola de Firebase.
2. Crea una base de datos **Cloud Firestore** en modo de prueba o producción.
3. Crea un archivo `.env.local` en la raíz de este proyecto con tus credenciales:
   ```env
   NEXT_PUBLIC_DATABASE_PROVIDER="firebase"
   NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="tu-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="tu-app-id"
   ```
4. Al reiniciar el servidor de desarrollo (`npm run dev`), la aplicación se conectará a Firebase e inicializará automáticamente la colección de productos y pedidos semilla (seeding automático).
