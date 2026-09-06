# FurNio — Furniture Accounting System

FurNio is a full-stack accounting application for furniture businesses. It brings the workflow from purchase order to vendor bill, sales order, invoice, payment, and double-entry journal entries into one role-aware workspace.

## Screenshots

The product includes a responsive landing page with light and dark themes, plus a finance dashboard for day-to-day accounting work.

| Landing page — light | Finance dashboard |
| --- | --- |
| ![FurNio light landing page](docs/screenshots/landing-light.png) | ![FurNio finance dashboard](docs/screenshots/finance-dashboard.png) |

| Landing page — dark |
| --- |
| ![FurNio dark landing page](docs/screenshots/landing-dark.png) |

> Place the supplied screenshots in `docs/screenshots/` using the filenames above. They are intentionally kept outside the application bundle.

## Highlights

- Role-based access for administrators, accountants, and customer portal users.
- Authentication with hashed passwords and JWTs.
- Master-data management for contacts, products, accounts, journals, analytic accounts, and budgets.
- Purchase orders, vendor bills, sales orders, customer invoices, payments, and journal entries.
- Balance Sheet, Profit & Loss, and budget reporting.
- Automatic first-letter avatar for each signed-in or newly registered user.
- Responsive UI with light and dark themes.
- Containerized local environment with PostgreSQL, Prisma migrations, Express API, and Nginx-served frontend.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Zustand |
| UI | Tailwind CSS, reusable UI primitives, Lucide icons, GSAP, Locomotive Scroll |
| Backend | Node.js, Express 5, Zod |
| Database | PostgreSQL 16, Prisma 7, Prisma PostgreSQL adapter |
| Security | bcryptjs password hashing, JSON Web Tokens, CORS |
| Deployment | Docker Compose, multi-stage Dockerfiles, Nginx |

## Project structure

```text
DealFlow-Odoo/
├── docker-compose.yml          # PostgreSQL, migrations, API, and web app
├── Readme.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Versioned database migrations
│   │   └── seed.js             # Optional seed data
│   ├── src/
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── routes/             # API route definitions
│   │   ├── validators/         # Zod request validation
│   │   ├── middleware/         # Authentication and authorization
│   │   ├── libs/               # Prisma client setup
│   │   ├── utils/              # JWT, ledger, and document helpers
│   │   └── index.js            # Express application entry point
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI, landing, and dashboard components
│   │   ├── pages/              # Public and dashboard route pages
│   │   ├── store/              # Zustand application state
│   │   ├── lib/                # API client, theme, scrolling, and helpers
│   │   ├── assets/             # Application assets
│   │   ├── App.tsx             # Route map
│   │   └── main.tsx            # React entry point
│   ├── Dockerfile
│   └── nginx.conf              # SPA hosting and /api proxy
└── docs/
    └── screenshots/            # README screenshots (add supplied images here)
```

## Roles and access

| Role | Access |
| --- | --- |
| `ADMIN` | Full access, including user management and all accounting modules. |
| `ACCOUNTANT` | Master data, transactions, and reports. |
| `USER` | Customer portal, own invoices/bills, payments, and settings. |

The first registered account becomes an administrator. Customer portal users are associated with a customer contact.

## Run with Docker (recommended)

### Prerequisites

- Docker Desktop with Docker Compose

### Start the application

```bash
docker compose up --build
```

Open the application at [http://localhost:8080](http://localhost:8080).

The frontend proxies API requests to the internal backend at `/api`. PostgreSQL is available on `localhost:5432` for database tools. The migration container runs `prisma migrate deploy` before the backend starts.

To stop the stack while retaining database data:

```bash
docker compose down
```

> Do not add `-v` unless you intentionally want to delete the PostgreSQL volume and all local data.

## Run locally for development

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Configure the backend

```bash
cd backend
copy .env.example .env
npm install
npm run generate
npm run migrate
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local frontend address, normally `http://localhost:5173`.

## Environment variables

Create `backend/.env` from `backend/.env.example` for local development.

| Variable | Purpose |
| --- | --- |
| `PORT` | Express port; defaults to `3000`. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Secret used to sign authentication tokens. Use a strong unique value outside local development. |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d`. |
| `CLIENT_URL` | Comma-separated browser origins allowed by CORS. |

For Docker Compose, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` can be supplied through a root `.env` file. The default local password is `dealflow123`, matching the existing Compose database volume.

## API overview

The backend is mounted under `/api`.

| Area | Base route | Examples |
| --- | --- | --- |
| Authentication | `/api/auth` | `POST /register`, `POST /login`, `GET /me` |
| Dashboard | `/api/dashboard` | Summary data for the dashboard |
| Master data | `/api/contacts`, `/api/products`, `/api/accounts` | CRUD operations |
| Journals & budgets | `/api/journals`, `/api/analytic-accounts`, `/api/budgets` | Accounting configuration |
| Transactions | `/api/purchase-orders`, `/api/vendor-bills`, `/api/sales-orders`, `/api/customer-invoices`, `/api/payments` | Purchase-to-payment workflows |
| Reports | `/api/reports` | Financial and budget reports |

Protected endpoints expect an `Authorization: Bearer <token>` header. The frontend Axios client attaches this token automatically after login or registration.

## Database workflow

```bash
cd backend
npm run generate        # Generate Prisma client
npm run migrate         # Create and apply a development migration
npm run migrate:deploy  # Apply committed migrations (Docker/production)
npm run seed            # Seed data, when needed
```

## Available scripts

| Directory | Command | Description |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the Vite development server. |
| `frontend` | `npm run build` | Type-check and build production assets. |
| `frontend` | `npm run lint` | Run Oxlint. |
| `backend` | `npm run dev` | Start the API with Nodemon. |
| `backend` | `npm start` | Start the API in production mode. |
| `backend` | `npm run generate` | Generate the Prisma client. |
| `backend` | `npm run migrate:deploy` | Apply committed Prisma migrations. |

## Production notes

- Set a unique, long `JWT_SECRET`.
- Use a managed PostgreSQL instance or secure persistent volume backups.
- Set `CLIENT_URL` to the deployed frontend origin.
- Terminate TLS at a reverse proxy or hosting platform.
- Do not expose PostgreSQL publicly unless it is protected and needed.

## License

This project was created for the Odoo Hackathon / Urban Furniture Accounting System project.
