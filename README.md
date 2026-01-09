# Job Portal (React + Spring Boot + MySQL)

Full‑stack job portal with:
- Public job browsing/search
- CV upload (authenticated)
- Admin dashboard to manage jobs

## Clean project structure (recommended)

```
job/
  backend/
    pom.xml
    src/
    db/
      schema.sql
  frontend/
    package.json
    public/
    src/
  README.md
```

## Prerequisites

- **Java**: JDK 17+
- **MySQL**: 8.0+ running on `localhost:3306`
- **Node.js**: 16+ (18+ recommended) + npm
- **Maven**: required to run backend from terminal
  - If you don’t want to install Maven, run backend from your IDE (IntelliJ/Eclipse/VS Code).

## Backend (Spring Boot)

### Configure database

Edit `backend/src/main/resources/application.properties`:
- `spring.datasource.username`
- `spring.datasource.password`

Optional schema (manual): `backend/db/schema.sql`

### Run backend (port 8080)

From terminal (requires Maven):

```powershell
cd d:\job\backend
mvn spring-boot:run
```

If port 8080 is busy, change:
- `server.port` in `backend/src/main/resources/application.properties`

### Verify backend

- `http://localhost:8080/api/jobs` should return JSON (often `[]` initially).

### Default admin

- Email: `admin@jobportal.com`
- Password: `admin123`

## Frontend (React)

```powershell
cd d:\job\frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## React → Spring Boot (no CORS errors)

What to verify:
- **Frontend API base URL**: `frontend/src/services/api.js` points to `http://localhost:8080/api`
- **Backend CORS**: allowed origin includes `http://localhost:3000`
- **Spring Security**: `.cors(...)` enabled and `OPTIONS` allowed (preflight)
- **Auth header**: allow `Authorization` header if using JWT

If you still see a CORS error, open Chrome DevTools → Network → the failing request and share:
- Request URL
- Status code
- Response headers

## UI Nav cleanup

Public pages use a shared navbar component at:
- `frontend/src/components/Navbar.js`

It removes public **Login/Register** links and keeps only **Admin Login** on the right.


