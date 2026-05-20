# Leave Management System

This repository contains the backend foundation for a Leave Management System built with Spring Boot 3, Spring Security JWT, JPA/Hibernate, and MySQL 8.

## Local Run

### Docker

Start the stack from the repository root:

```bash
docker compose up --build
```

Stop it:

```bash
docker compose down
```

The Docker startup order is:
1. `mysql`
2. `backend`

The backend waits for MySQL to become healthy before starting.

Useful URLs after startup:
- API base: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

Uploads are stored in a named Docker volume mounted at `/app/uploads` inside the backend container.

### Local Backend Without Docker

If MySQL 8 is running locally and Maven is installed:

```powershell
cd backend
mvn spring-boot:run
```

The backend uses the `local` Spring profile by default.

By default the local backend uses:
- database host: `localhost`
- database port: `3306`
- database name: `leave_db`
- database username: `root`
- database password: empty
- SMTP host: `localhost`
- SMTP port: `1025`

Equivalent JDBC URL:

```text
jdbc:mysql://localhost:3306/leave_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

Local MySQL requirements:
- MySQL must already be installed and running on `localhost:3306`
- the configured MySQL user must be able to connect to `leave_db`
- if the database does not exist yet, the default local JDBC URL will create `leave_db` automatically when the MySQL user has permission to create databases
- if your MySQL user does not have database creation permission, create `leave_db` manually first

Example PowerShell command with an explicit local password:

```powershell
cd backend
$env:DB_USERNAME='root'
$env:DB_PASSWORD='your_mysql_password'
$env:DB_NAME='leave_db'
mvn spring-boot:run
```

## Environment Variables

The backend now reads runtime settings from environment variables with local defaults:

- `SERVER_PORT`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`
- `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`
- `APP_MAIL_FROM`
- `APP_JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_FILE_STORAGE_UPLOAD_DIR`
- `APP_FILE_STORAGE_MAX_FILE_SIZE`

## Notes

- SQL schema and seed data are initialized on startup with `spring.sql.init.mode=always`.
- File uploads are validated in the application layer and stored under `uploads/{userId}/{UUID}.{ext}`.
- Email delivery is optional for local development. If no SMTP server is reachable, the application logs a warning and continues.
