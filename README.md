

### Incializar la base de datos
```bash
docker-compose down
docker network prune
docker-compose up --build
```

### Inicilizar el servicio en modo desarrollador
```bash
pnpm install
pnpm rebuild
pnpm start:dev
```

<br>

# Manejo de errorers
### `createMicroservice not found`
Si se encuentras con este error, vas a realizar los siguientes pasos:
1. Borrar los siguientes archivos y carpetas: `node_modules` `pnpm-lock.yml` 
2. Instalar las dependencias.
    ```bash
    pnpm install
    ```
3. Reconstruir y actulizar los paquetes
    ``` bash
    pnpm rebuild
    ```
4. Correr el servicio.
    ``` bash
    pnpm start:dev
    ```
