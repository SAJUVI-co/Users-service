

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

