# n8n Marketplace Backend

A production-ready NestJS backend for the n8n automation marketplace.

## Features

- **Authentication**: JWT-based auth with Google OAuth support.
- **Workflows**: CRUD operations, search, and filtering.
- **Downloads**: Track downloads with rate limiting for free users.
- **Subscriptions**: Skeleton for subscription management.
- **Payments**: Skeleton for Stripe integration.
- **Documentation**: Swagger API documentation.

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or Atlas)
- Google Cloud Console Project (for OAuth)
- Stripe Account (for payments)

## Setup

1.  **Clone the repository** (if not already done).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```
    *Note: You must provide `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, and `GEMINI_API_KEY` for full functionality.*

4.  **Run the application**:
    ```bash
    # Development
    npm run start:dev

    # Production
    npm run build
    npm run start:prod
    ```

## API Documentation

Once the server is running, visit `http://localhost:3001/api` to view the Swagger documentation.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
