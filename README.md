# API Tests EBAC — Hub de Leitura

An educational library REST API with Cypress tests for practicing API testing and Quality Assurance. The backend manages users, books, baskets, and reservations using Express and SQLite. The current automated suite focuses on user management.

API messages and sample data are mostly in Portuguese. All terminal examples below use **Git Bash** and run from the project root.

## Contents

- [Technology and structure](#technology-and-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Accounts and authentication](#accounts-and-authentication)
- [API reference](#api-reference)
- [Database and sample data](#database-and-sample-data)
- [Cypress tests](#cypress-tests)
- [Troubleshooting](#troubleshooting)
- [Contributing and credits](#contributing-and-credits)

## Technology and structure

| Component | Purpose |
| --- | --- |
| Node.js / Express 4 | HTTP server and routing |
| SQLite / `sqlite3` | Persistent local database |
| `bcrypt` | Password hashing with 10 salt rounds |
| `jsonwebtoken` | JWT authentication and admin claims |
| Joi | Book and reservation validation |
| `swagger-jsdoc` / `swagger-ui-express` | OpenAPI specification and interactive documentation |
| Cypress / `cypress-plugin-api` | API requests, assertions, and request display in the runner |
| Nodemon | Development server restarts |

Jest and Supertest are declared as development dependencies, but the repository contains no Jest suite or `npm test` script. Cypress and `cypress-plugin-api` are used by the test files but are currently missing from both dependency manifests; see [Cypress tests](#cypress-tests).

```text
api-tests-ebac/
├── config/
│   ├── db.js                         # SQLite connection and database helpers
│   ├── setup.js                      # Optional legacy setup utility
│   └── swaggerDef.js                 # OpenAPI schemas and source configuration
├── cypress/
│   ├── e2e/users.cy.js               # User API scenarios
│   ├── fixtures/example.json         # Starter fixture; unused by the user suite
│   └── support/
│       ├── commands.js               # Login and user creation helpers
│       └── e2e.js                    # Imports commands and cypress-plugin-api
├── data/books.json                   # Book seed data
├── database/biblioteca.db            # Database used by the API
├── scripts/init_db.js                # Creates tables and inserts sample data
├── src/
│   ├── controllers/                  # Resource and administration logic
│   ├── middleware/auth.js            # JWT and authorization middleware
│   ├── routes/                       # Routes and Swagger annotations
│   └── server.js                     # App setup, login, registration, system routes
├── cypress.config.js                # Test base URL and Node event configuration
└── package.json
```

Requests pass through Express routes, authentication middleware where required, and controllers that query SQLite through `config/db.js`.

## Getting started

### Prerequisites

- Node.js and npm. The original setup utility recommends Node.js 18 or newer.
- Git and Git Bash for the commands below.
- A local database with the project schema.

### Install and start

```bash
git clone https://github.com/julianoaperes/api-tests-ebac.git
cd api-tests-ebac
npm install
npm start
```

The repository includes `database/biblioteca.db`. Startup uses that file as it is; it does **not** recreate missing accounts, tables, or sample data.

If the database file is missing, initialize it before starting the API:

```bash
mkdir -p database
npm run db
npm start
```

Run `npm run db` only when initializing a new database. It inserts records each time and is not a safe way to refresh an existing database.

| Address | Purpose |
| --- | --- |
| `http://localhost:3000/api/` | API base URL |
| `http://localhost:3000/api-docs` | Interactive Swagger documentation |
| `http://localhost:3000/api/health` | Database connection status and service information |
| `http://localhost:3000/api/info` | API metadata |

Outside production mode, startup also attempts to open Swagger in the default browser.

### Available npm scripts

| Command | Behavior |
| --- | --- |
| `npm start` | Runs `node src/server.js` |
| `npm run dev` | Runs the API with Nodemon |
| `npm run db` | Creates tables and inserts books, accounts, and sample reservations |

## Configuration

| Environment variable | Default | Behavior |
| --- | --- | --- |
| `PORT` | `3000` | HTTP listening port |
| `JWT_SECRET` | `admin@admin` | Key used to sign and verify JWTs |
| `NODE_ENV` | Unset | Controls development logs, some error details, and browser opening |

Set variables directly in Git Bash:

```bash
PORT=3001 JWT_SECRET='local-qa-secret' NODE_ENV=production npm start
```

`NODE_ENV=production` disables automatic browser opening and development request logs. It does not change the authorization rules described below.

The current server does not load `.env` automatically, even though `dotenv` is installed. The database path is fixed in `config/db.js` to `database/biblioteca.db`; `DB_PATH` is not read.

`config/setup.js` is a legacy helper that installs dependencies, creates directories, and writes `.env`. Some settings it writes are unused by the current server. The manual commands above match the current application.

## Accounts and authentication

### Seed accounts

On a newly initialized database, `scripts/init_db.js` creates:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@biblioteca.com` | `admin123` |
| Regular user | `usuario@teste.com` | `user123` |

These accounts may differ or be absent in an existing database. The Cypress suite logs in as the administrator before every test.

### Create a missing administrator

With the API running:

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Biblioteca Admin",
    "email": "admin@biblioteca.com",
    "password": "admin123",
    "isAdmin": true
  }'
```

A successful response has status `201` and includes `user.id` and `user.isAdmin`. The controller hashes the password and stores admin permission as `isAdmin = 1`.

**Current authorization behavior:** `POST /api/users` is public and accepts `isAdmin: true` without an existing admin token. This lets a caller create an administrator in this QA application. `POST /api/register` always creates a regular user. `PUT /api/users/:id` does not change the admin role.

### Log in

```bash
curl -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@biblioteca.com","password":"admin123"}'
```

The response includes:

- `id`, `name`, `email`, and `isAdmin` for the account.
- `token`, which already includes the `Bearer ` prefix.
- `token_for_swagger`, which contains only the JWT.
- `expiresIn: "8h"`.

Copy the complete `token` value into a variable for protected requests:

```bash
TOKEN='Bearer paste-the-jwt-here'

curl http://localhost:3000/api/users \
  -H "Authorization: $TOKEN"
```

In Swagger, click **Authorize** and paste `token_for_swagger` without the `Bearer ` prefix. Swagger adds the prefix automatically.

JWTs contain the user's ID, email, and admin flag. Role changes in the database require logging in again to obtain a token with updated claims.

## API reference

Paths below are relative to `/api`. Send JSON bodies with `Content-Type: application/json`. Use Swagger for detailed examples; the tables reflect registered routes and controller checks.

### Authentication and system

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/login` | Public | Authenticate with `email` and `password` |
| POST | `/register` | Public | Create a regular user with `name`, `email`, and `password` |
| POST | `/contact` | Public | Save `name`, `email`, `subject`, and `message` |
| GET | `/health` | Public | Return service and database connection information |
| GET | `/info` | Public | Return API metadata |

The health endpoint reports database state in its JSON payload; it currently returns HTTP `200` even when the database check fails.

Legacy GET routes redirect `/produtos` to `/books`, `/produtos/:id` to `/books/:id`, and `/registrar` to `/register`. The registration destination accepts POST, so use `POST /register` to create an account.

### Users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/users` | Admin | List users, reservation counts, and pagination |
| POST | `/users` | Public | Create a user; accepts optional `isAdmin` |
| GET | `/users/:id` | Owner or admin | Get a profile and statistics |
| PUT | `/users/:id` | Owner or admin | Update name, email, or password |
| DELETE | `/users/:id` | Admin | Delete a user, subject to dependencies |

User creation requires a name of at least two characters, a valid email, and a password of at least six characters. Duplicate emails return `400`. Listing supports `page` (default `1`), `limit` (default `20`), and `search` matching name or email.

```bash
curl --get http://localhost:3000/api/users \
  -H "Authorization: $TOKEN" \
  --data-urlencode 'search=Usuário' \
  --data-urlencode 'page=1' \
  --data-urlencode 'limit=20'
```

Profile updates receive fields such as phone and reading preferences but do not persist them. Profile response timestamps are generated by the controller rather than read from stored audit fields. Deletion rejects users with `active` or `picked-up` reservations; other foreign key references can also prevent deletion.

### Books

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/books` | Public | Search and paginate the catalog |
| GET | `/books/categories` | Public | List categories and copy counts |
| GET | `/books/authors` | Public | List authors and copy counts |
| GET | `/books/:id` | Public | Get details, availability, and review statistics |
| POST | `/books` | Admin | Create a book |
| PUT | `/books/:id` | Admin | Update a book |
| DELETE | `/books/:id` | Admin | Delete a book, subject to dependencies |

Catalog filters include `search` (title or author), `category`, `author`, and `available=true|false`. Pagination uses `page` and `limit`, or an explicit `offset`; `limit` defaults to `20` and is capped at `100`. Sorting accepts `orderBy=title|author|category|publication_year|pages` and `order=ASC|DESC`.

Book creation and update both require `title` and `author`. Optional fields include `description`, `category`, `isbn`, `editor`, `language`, `publication_year`, `pages`, `format`, `total_copies`, `available_copies`, and `cover_image`. Formats are `Físico`, `Digital`, or `Audiobook`. `cover_image` is a string field; there is no upload endpoint.

### Basket

All basket operations require a token and enforce ownership, including for administrators.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/basket/:userId` | List the user's basket |
| POST | `/basket` | Add a book with `userId`, `bookId`, and optional `quantity` |
| DELETE | `/basket/:userId/:bookId` | Remove one book |
| DELETE | `/basket/:userId` | Clear the basket |
| GET | `/basket/:userId/check-availability` | Check current availability |

Quantity must be `1`. Duplicate entries and unavailable books are rejected. Adding to the basket does not reserve inventory; availability is checked again when reservations are created.

### User reservations

These routes require a token and use the authenticated user's ID.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/reservations` | List the user's reservations and statistics |
| POST | `/reservations` | Reserve a book using `bookId` and optional `notes` |
| POST | `/reservations/from-basket` | Create reservations from basket items |
| GET | `/reservations/statistics` | Get totals, status counts, and favorite categories |
| PUT | `/reservations/:id` | Apply `action: "cancel"` or `action: "update_notes"` |
| DELETE | `/reservations/:id` | Cancel an owned reservation |

Listing supports `status`, `limit`, `offset`, and `orderBy=asc|desc`. Notes on individual reservation creation and updates are limited to 500 characters.

Individual creation checks availability, an existing `active` reservation for the same book, and a maximum of five reservations stored as `active`. New reservations reduce available copies and have a 48-hour pickup deadline. Cancelling an `active` reservation returns a copy to availability. Basket checkout accepts optional `notes` and `clearBasket` (default `true`).

### Administration

All routes below require an admin token.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/reservations` | List all reservations with user and book details |
| GET | `/admin/reservations/stats` | Get active, picked-up, returned-today, and overdue counts |
| GET | `/admin/reservations/search` | Filter reservations |
| PUT | `/admin/reservations/:id` | Update `status` and optional `notes` |
| PUT | `/admin/reservations/:id/extend` | Extend a return deadline |

Search accepts `status`, `userId`, `bookId`, `startDate`, `endDate`, `limit` (default `50`), and `offset` (default `0`). Status updates accept `active`, `picked-up`, `returned`, `cancelled`, and `expired`. Changing an active reservation to `picked-up` sets a 14-day return deadline. Extension accepts `days` from `1` to `30`, defaulting to `7`.

Admin and user controllers interpret some states differently: admin pickup stores `picked-up`, while some user statistics infer pickup and overdue states from `active` records and timestamps. Calculated status fields do not automatically update stored status. Inventory changes also depend on the previous and new statuses; verify copy counts when testing transitions.

There is no registered `/admin/users` route; user administration uses `/users`.

### Response conventions

| Status | Common meaning |
| --- | --- |
| `200` | Successful read, update, cancellation, or deletion |
| `201` | Successful creation |
| `400` | Invalid input, duplicate data, or business rule rejection |
| `401` | Missing, invalid, or expired credentials/token |
| `403` | Insufficient permissions or ownership mismatch |
| `404` | Missing resource or unregistered endpoint |
| `500` | Database or server error |

Response shapes vary by endpoint. Errors can contain `message`, `error`, `details`, or contextual fields. User tests assert Portuguese messages returned by the controllers.

## Database and sample data

`config/db.js` opens `database/biblioteca.db` and enables SQLite foreign keys. `scripts/init_db.js` creates these tables:

| Table | Contents |
| --- | --- |
| `Users` | Accounts, hashed passwords, and admin flags |
| `Books` | Catalog metadata and copy counts |
| `Reservations` | User/book links, status, deadlines, notes, and renewal counts |
| `Basket` | Unique user/book entries; cascading deletion on user/book removal |
| `Contacts` | Contact form submissions |
| `BookReviews` | Ratings and review text; read by book detail queries |
| `LoanHistory` | Loan history schema |
| `Wishlist` | Wishlist schema |

`LoanHistory` and `Wishlist` have no registered API routes. There is no review-writing route. Foreign keys on reservations, reviews, and history tables do not all cascade, so deletion can fail even if a controller's active-reservation check passes.

The seed loads books from `data/books.json`, maps each entry's `available` value to both copy counts, hashes the two account passwords, and inserts example reservations. It generates replacement ISBNs for duplicates or missing values. Sample reservations assume user ID `2` and book IDs `1` and `3`.

Editing `data/books.json` does not change the running database. Restarting the API does not seed records. Re-running the initializer against an existing database can duplicate books and reservations, report duplicate account emails, and change inventory counts.

### Recreate a local test database

Stop the API with **Ctrl+C** first. These Git Bash commands move the current database to a backup and create fresh sample data:

```bash
mv -i database/biblioteca.db database/biblioteca.backup.db
npm run db
npm start
```

Keep the backup until the new database is verified. If a backup already exists, choose another backup filename before proceeding. Resetting changes IDs and removes previous records from the active database.

## Cypress tests

### Install test dependencies

The test configuration requires Cypress, and `cypress/support/e2e.js` imports `cypress-plugin-api` to provide `cy.api()`. On a fresh checkout, install both:

```bash
npm install --save-dev cypress cypress-plugin-api
```

This updates `package.json` and `package-lock.json` to declare the missing test dependencies.

### Run the suite

Start the API in one terminal:

```bash
npm start
```

In another terminal, open the runner or run the user spec headlessly:

```bash
npx cypress open
```

```bash
npx cypress run --spec 'cypress/e2e/users.cy.js'
```

The configured `baseUrl` is `http://localhost:3000/api/`. To target another port:

```bash
npx cypress run --spec 'cypress/e2e/users.cy.js' \
  --config 'baseUrl=http://localhost:3001/api/'
```

### Current coverage

| Operation | Scenarios and assertions |
| --- | --- |
| GET | List users; verify the users array; check `id`, `name`, and `email`; fetch user `2`; send search and pagination parameters |
| POST | Register with a timestamp-based email and expect `201`; reject an invalid email with `400` and the expected message |
| PUT | Create a user, update it using its returned ID and unique email, and verify `200` and the success message |
| DELETE | Create a user, delete it using its returned ID, and verify `200` and the success message |

`beforeEach` logs in using `admin@biblioteca.com` / `admin123` and stores the token for protected requests. The filter test asserts status `200`; it does not verify that every returned row matches the search.

### Custom commands

| Command | Behavior |
| --- | --- |
| `cy.tokenGenerator(email, password)` | Posts to `login`, expects `200`, and yields the complete Bearer token |
| `cy.registerUserId(name, email, password)` | Posts to `users`, expects `201`, and yields `response.body.user.id` |

### Test data prerequisites

- The admin account must exist with the password above.
- User ID `2` must exist for the current GET-by-ID test.
- The user list must contain at least one row for property assertions.
- The DELETE scenario uses `teste@teste.com`; that email must be available before the test starts. An interrupted run may leave it registered.
- POST and PUT scenarios leave their created users in the database. Tests mutate the configured API's database and do not automatically reset it.

Cypress screenshots, videos, and downloads are ignored by Git. The current repository has no CI workflow or npm test script; run Cypress using the commands above.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Database not found | Initialize a missing database with `mkdir -p database` and `npm run db` before starting the API. |
| Admin login returns `401` | Verify the account exists and password matches. Use the admin creation example if it is missing; restarting will not restore it. |
| Duplicate email returns `400` | Use a new email or remove the leftover test user through an authorized request. |
| Cypress cannot find a module or `cy.api` | Install both test packages and check the plugin import in `cypress/support/e2e.js`. |
| Port already in use | Run `PORT=3001 npm start` and override Cypress's base URL. Swagger's server URL is separately fixed to port `3000` in `config/swaggerDef.js`. |
| Protected request returns `401` | Log in again after token expiry and send `Authorization: Bearer <JWT>`. Avoid adding `Bearer` twice. |
| Protected request returns `403` | Check the token's admin claim and resource ownership. |
| GET-by-ID test returns `404` | Confirm user ID `2` exists; dynamically created users do not satisfy that fixed-ID prerequisite. |
| Delete returns `400` or a database error | Check active reservations and remaining foreign key references. |
| `.env` values have no effect | Export variables in Git Bash or set them inline; the server does not call `dotenv.config()`. |

## Contributing and credits

For new scenarios, create test users with unique emails, use returned IDs for mutations, assert response fields relevant to the behavior, and clean up records when practical. Include the tested command and outcome in pull requests.

This repository builds on the educational **Hub de Leitura API** by **Fábio Araújo** and adds API test automation for EBAC practice.

- [Original API repository](https://github.com/EBAC-QE/hub-de-leitura-api)
- [Fábio Araújo on GitHub](https://github.com/fabioaraujoqa)
- [Fábio Araújo on LinkedIn](https://www.linkedin.com/in/fabio10/)

The package metadata declares the license as `ISC`.
