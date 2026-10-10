# Sistema de Ferretería

Proyecto de ejemplo listo para ejecutar con Docker Compose. Incluye:
- **Frontend:** React + Vite (http://localhost:5173)
- **Backend:** Java 17 + Spring Boot + Spring Data JPA (http://localhost:8080)
- **Base de datos:** MySQL 8
- **API CRUD:** `GET/POST/PUT/DELETE http://localhost:8080/productos`

## Requisitos
1. Instalar y abrir **Docker Desktop**.
2. Tener conexión a Internet la primera vez para descargar las imágenes y dependencias.

## Cómo ejecutarlo
1. Descomprime `sistema-ferreteria.zip`.
2. Abre una terminal dentro de la carpeta `sistema-ferreteria`.
3. Ejecuta:

   ```bash
   docker compose up --build
   ```

4. Espera a que los tres servicios terminen de iniciar.
5. Abre en el navegador:
   - Aplicación: http://localhost:5173
   - API: http://localhost:8080/productos

Para detenerlo: `Ctrl + C`, luego `docker compose down`.
Para detenerlo y borrar también los datos de MySQL: `docker compose down -v`.

## Uso
Desde la interfaz puedes registrar, editar, eliminar y consultar productos. Los datos quedan guardados en el volumen de MySQL aunque detengas los contenedores normalmente.

## Credenciales locales de MySQL
- Base de datos: `ferreteria_db`
- Usuario: `ferreteria`
- Contraseña: `ferreteria123`
- Puerto del host: `3307`

Estas credenciales son únicamente para ejecución local de demostración; cámbialas antes de desplegar en producción.
