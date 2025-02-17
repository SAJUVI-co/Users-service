# Microservicio de Gestión de Usuarios

Este microservicio permite registrar, autenticar y gestionar usuarios. Está construido con **NestJS** y utiliza una base de datos MySQL. A continuación, se presenta una guía detallada para configurar, ejecutar y utilizar este microservicio.

---

## Tabla de Contenido

- [Requisitos Previos](##Requisitos-Previos)
- [Configuración](##Configuración)
    - [Variables de Entorno](###Variables-de-Entorno)
- [Inicialización del Servicio](##Inicialización-del-Servicio)
    - [Inicializaci[on del servicio]](##Inicialización-del-Servicio)
    - [Inicializar la Base de Datos](###Inicializar-la-Base-de-Datos)
    - [Iniciar el Servicio en Modo Desarrollo](###Iniciar-el-Servicio-en-Modo-Desarrollo)
- [API del Microservicio](##API-del-Microservicio)
    - [Rutas Disponibles](###Rutas-Disponibles)
    - [Ejemplo de Uso](###Ejemplo-de-Uso)
- [Manejo de Errores Comunes](##Manejo-de-Errores-Comunes)

---

## Requisitos Previos

1. Tener instalado:
    - **Node.js** (v16 o superior)
    - **PNPM** (v8 o superior)
    - **Docker** y **Docker Compose**
2. Asegurarte de que los puertos necesarios estén disponibles (por defecto: `3307` para la base de datos y `5000` para el servidor).

---

## Configuración

### Variables de Entorno

Debes configurar las variables de entorno en un archivo `.env` en la raíz del proyecto. Aquí hay un ejemplo de configuración:

```
env
CopiarEditar
MYSQL_USER="nombre_usuario"
MYSQL_ROOT_PASSWORD="contraseña_root"
MYSQL_DATABASE="nombre_base_datos"
MYSQL_PASSWORD="contraseña_mysql"
MYSQL_HOST="127.0.0.1"
MYSQL_PORT=3306

DOCKER_DB_PORT=3307

SERVER_HOST="127.0.0.1"
SERVER_PORT=5000

```

### Descripción de las Variables de Entorno

| Variable | Descripción |
| --- | --- |
| `MYSQL_USER` | Usuario de la base de datos MySQL. |
| `MYSQL_ROOT_PASSWORD` | Contraseña del usuario root de MySQL. |
| `MYSQL_DATABASE` | Nombre de la base de datos donde se almacenarán los usuarios. |
| `MYSQL_PASSWORD` | Contraseña del usuario de MySQL especificado en `MYSQL_USER`. |
| `MYSQL_HOST` | Dirección del servidor MySQL. Normalmente es `localhost` o `127.0.0.1` si está en tu máquina. |
| `MYSQL_PORT` | Puerto del servidor MySQL. Por defecto, es `3306`. |
| `DOCKER_DB_PORT` | Puerto que el contenedor de la base de datos expondrá en tu máquina local. |
| `SERVER_HOST` | Dirección del servidor del microservicio. |
| `SERVER_PORT` | Puerto donde se ejecutará el microservicio. |

---

## Inicialización del Servicio

### Inicializar la Base de Datos

Para configurar y levantar la base de datos en un contenedor Docker, utiliza los siguientes comandos:

```bash
bash
CopiarEditar
docker-compose down
docker network prune
docker-compose up --build

```

### Iniciar el Servicio en Modo Desarrollo

Ejecuta el siguiente conjunto de comandos para instalar las dependencias y levantar el servidor en modo desarrollo:

```bash
bash
CopiarEditar
pnpm install
pnpm rebuild
pnpm start:dev

```

---

## API del Microservicio

### Rutas Disponibles

El microservicio utiliza patrones de mensajes para comunicarse. A continuación, se describen las funcionalidades disponibles:

### **1. Crear Usuario**

- **Patrón de Mensaje:** `createUser`
- **Entrada:** Un objeto de tipo `CreateUserDto` con los datos del usuario.
- **Respuesta:** Devuelve un booleano indicando si la operación fue exitosa.

### **2. Obtener Todos los Usuarios (Paginados)**

- **Patrón de Mensaje:** `{ cmd: 'findAllUsers' }`
- **Entrada:** Un objeto con las siguientes propiedades:
    - `skip` (número de registros a saltar).
    - `limit` (límite de registros a retornar).
    - `order` (`ASC` o `DESC` para el orden).
- **Respuesta:** Una lista de usuarios paginados.

### **3. Obtener Todos los Usuarios (Sin Paginación)**

- **Patrón de Mensaje:** `{ cmd: 'findAll' }`
- **Entrada:** Sin parámetros.
- **Respuesta:** Devuelve una lista completa de usuarios.

### **4. Login de Usuario**

- **Patrón de Mensaje:** `login`
- **Entrada:** Un objeto de tipo `LoginUserDto` con el email y contraseña del usuario.
- **Respuesta:** Actualiza el estado en línea del usuario y devuelve sus datos.

### **5. Actualizar Usuario**

- **Patrón de Mensaje:** `updateUser`
- **Entrada:** Un objeto de tipo `UpdateUserDto` con los datos del usuario a modificar.
- **Respuesta:** Devuelve un booleano indicando si la actualización fue exitosa.

### **6. Eliminar Usuario**

- **Patrón de Mensaje:** `removeUser`
- **Entrada:** El ID del usuario a eliminar.
- **Respuesta:** Devuelve un booleano indicando si la operación fue exitosa.

---

### Ejemplo de Uso

Aquí hay un ejemplo de cómo enviar un mensaje al microservicio usando **NestJS Microservices**.

```tsx
typescript
CopiarEditar
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

const client = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: {
    host: '127.0.0.1',
    port: 5000,
  },
});

async function createUser() {
  const userDto = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    password: 'password123',
  };

  const result = await client.send<boolean>('createUser', userDto).toPromise();
  console.log(result ? 'Usuario creado exitosamente' : 'Error al crear usuario');
}

createUser();

```

---

## Manejo de Errores Comunes

### Error: `createMicroservice not found`

Si encuentras este error al iniciar el microservicio, sigue estos pasos:

1. Elimina los archivos y carpetas:
    - `node_modules`
    - `pnpm-lock.yaml`
2. Reinstala las dependencias:
    
    ```bash
    pnpm install
    ```
    
3. Reconstruye y actualiza los paquetes:
    
    ```bash
    pnpm rebuild
    ```
    
4. Inicia nuevamente el servicio:
    
    ```bash
    pnpm start:dev
    ```
    

---

## Notas

1. Asegúrate de que los datos sensibles (como contraseñas y nombres de usuario) estén almacenados de manera segura y nunca los subas al repositorio.
2. Este microservicio está preparado para escalar utilizando múltiples instancias mediante un gestor de mensajes como RabbitMQ o Redis, según las necesidades del sistema.