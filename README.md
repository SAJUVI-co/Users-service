# User Service - Microservicio de Gestión de Usuarios

Este es un **microservicio de gestión de usuarios** diseñado para manejar la autenticación y el registro de usuarios en múltiples proyectos. El servicio tiene como único objetivo almacenar y manejar la información de los usuarios, sin almacenar ninguna información relacionada con los proyectos. Este microservicio está diseñado para ser utilizado en un entorno de **microservicios**.

### Objetivo

El objetivo principal de este servicio es proporcionar funcionalidades para:

- Registro de nuevos usuarios.
- Autenticación de usuarios mediante JWT.
- Gestión de usuarios (crear, actualizar, eliminar).
- Control de estado de los usuarios (en línea/offline).
- Soporte para roles de usuario (por ejemplo, administrador, invitado).
- Proteger rutas mediante autenticación y autorización de JWT.

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu máquina:

- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- **Docker** (opcional para base de datos, si prefieres no instalar MySQL localmente)

### Instalación

1.  **Clona el repositorio**:

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd user-service
    ```

2.  **Instala las dependencias**

    ```bash
    pnpm install
    ```

3.  **Configuración de la base de datos**
    Configurar las variables de entorno:
    `bash
    DATABASE_HOST=localhost
    DATABASE_PORT=3306
    DATABASE_USER=root
    DATABASE_PASSWORD=
    DATABASE_NAME=
    JWT_SECRET= 
    JWT_EXPIRATION_TIME=2m
    `

4.  **Configuración de la base de datos:**
    Este microservicio utiliza MySQL como base de datos. Si deseas ejecutar la base de datos localmente, puedes hacerlo mediante Docker con el siguiente comando:

        ```bash
        docker compose up
        ```

        > Si no funciona, verificar las variables de entorno

5.  **Levantar el servicio**
    ```bash
    pnpm start:dev # para levantar en modo desarrollo
    ```
    ```bash
    pnpm start:prod # para levantar en modo produccion
    ```

## 📌 **Resumen de las Rutas y sus Comandos**

| Método                     | Comando (`cmd`)           | Payload (Parámetros)                     |
| -------------------------- | ------------------------- | ---------------------------------------- |
| Crear usuario              | `createUser`              | `CreateUserDto`                          |
| Obtener todos los usuarios | `findAllUsers`            | `null`                                   |
| Ordenar por creación       | `findAllSortedByCreation` | `order: 'ASC' / 'DES'`                   |
| Ordenar por actualización  | `findAllSortedByUpdate`   | ` order: 'ASC' / 'DES'`                  |
| Usuarios en línea          | `findOnlineUsers`         | `null`                                   |
| Buscar por rol             | `findUsersByRole`         | `{ role: UserRole }`                     |
| Buscar usuario             | `findUser`                | `{ username: string, password: string }` |
| Actualizar usuario         | `updateUser`              | `UpdateUserDto`                          |
| Actualizar estado online   | `updateOnlineStatus`      | `{ userId: number, status: boolean }`    |
| Eliminar usuario           | `deleteUser`              | `{ id: number }`                         |

# Endpoints

1. Registro de Usuario

- **Ruta:** `createUser`
- **Descriocion:** Crea un nuevo usuario en el sistema.
- **Cuerpo:**
  ```json
  {
  "username": "usuarioEjemplo",
  "email": "usuario@ejemplo.com",
  "password": "contraseñaSegura",
  "email_recuperacion": "usuario@recuperacion.com"
  }
  ```

## Autorización
Para acceder a las rutas protegidas (como obtener todos los usuarios, actualizar o eliminar un usuario), debes incluir un token JWT válido en el encabezado de la solicitud:
```bash
Authorization: Bearer <JWT_TOKEN>
```

## Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución para el servidor.
- **NestJS:** Framework de Node.js para crear aplicaciones escalables.
- **TypeORM:** ORM para interactuar con la base de datos.
- **MySQL:** Base de datos relacional.
- **JWT (JSON Web Token):** Para la autenticación de usuarios.
- **Docker (opcional):** Para ejecutar la base de datos MySQL.

<br>

# Licencia

Este código está bajo licencia privada para el uso exclusivo de **Sajuvi**. No está permitido su uso, distribución ni modificación fuera de la organización de Sajuvi sin el consentimiento expreso de los responsables del proyecto.
