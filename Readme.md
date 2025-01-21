# Book Store API

A full-stack book store application enabling users to browse, purchase, and read books, with author publishing capabilities.

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd book-store
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** Create a `.env` file in the root directory with these variables:

   ```
   # Server Configuration
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   # Cloud Services
   CLOUD_NAME=your_cloudinary_name
   CLOUD_API_KEY=your_cloudinary_key
   CLOUD_API_SECRET=your_cloudinary_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Email Configuration
   MAILTRAP_TEST_USER=your_mailtrap_user
   MAILTRAP_TEST_PASS=your_mailtrap_password

   # Application URLs
   VERIFICATION_LINK=http://localhost:3000/auth/verify
   AUTH_SUCCESS_URL=http://localhost:3000/auth/success
   PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
   PAYMENT_CANCEL_URL=http://localhost:3000/payment/cancel
   BOOK_API_URL=http://localhost:3000/api/books
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Build for Production**

   ```bash
   npm run build
   npm start
   ```

## Tech Stack

### Core Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6.x

### Key Dependencies

- **ODM**: Mongoose for MongoDB interaction
- **Validation**: Zod for schema validation
- **Authentication**: JWT for token-based auth
- **Payments**: Stripe API integration
- **Storage**: Cloudinary for media files
- **Email**: Nodemailer with Mailtrap

## Features

### User Features

- 🔐 Secure email-link based authentication
- 📚 Browse and purchase books
- ⭐ Rate and review books
- 📖 Read purchased books online
- 🛒 Shopping cart management
- 💳 Secure payment processing via Stripe

### Author Features

- ✍️ Author registration and verification
- 📝 Book creation and management
- 📖 Book content management

## API Documentation

### Auth Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| POST | /auth/generate-link | Generate magic link for authentication | No |
| GET | /auth/verify | Verify authentication token | No |
| GET | /auth/profile | Get user profile | Yes |
| POST | /auth/logout | Logout user | Yes |
| PUT | /auth/profile | Update user profile | Yes |

### Author Routes

| Method | Endpoint         | Description           | Authentication Required |
| ------ | ---------------- | --------------------- | ----------------------- |
| POST   | /author/register | Register as an author | Yes                     |
| PATCH  | /author/         | Update author details | Yes                     |
| GET    | /author/:id      | Get author details    | No                      |

### Book Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| POST | /book/create | Create a new book | Yes (Author) |
| PATCH | /book/ | Update book details | Yes (Author) |
| GET | /book/list | Get all purchased books | Yes |
| GET | /book/details/:slug | Get book public details | No |
| GET | /book/by-genre/:genre | Get books by genre | No |
| GET | /book/read/:slug | Generate book access URL | Yes |
| GET | /book/recommended/:bookId | Get recommended books | No |

### Cart Routes

| Method | Endpoint    | Description      | Authentication Required |
| ------ | ----------- | ---------------- | ----------------------- |
| POST   | /cart/      | Update cart      | Yes                     |
| GET    | /cart/      | Get cart details | Yes                     |
| POST   | /cart/clear | Clear cart       | Yes                     |

### Checkout Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| POST | /checkout/ | Checkout cart | Yes |
| POST | /checkout/instant | Instant checkout for single book | Yes |

### Order Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| GET | /order/ | Get all orders | Yes |
| GET | /order/check-status/:bookId | Check order status | Yes |
| POST | /order/success | Handle successful order | Yes |

### Review Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| POST | /review/ | Add a review | Yes |
| GET | /review/:bookId | Get user review for a book | Yes |
| GET | /review/list/:bookId | Get public reviews for a book | No |

### History Routes

| Method | Endpoint | Description | Authentication Required |
| --- | --- | --- | --- |
| POST | /history/ | Update book reading history | Yes |
| GET | /history/:bookId | Get book reading history | Yes |

### Webhook Routes

| Method | Endpoint  | Description                   | Authentication Required |
| ------ | --------- | ----------------------------- | ----------------------- |
| POST   | /webhook/ | Handle Stripe payment webhook | No                      |

## Error Responses

All endpoints return consistent error responses in the following format:

```json
{
 "success": false,
 "error": {
  "message": "Error description",
  "code": "ERROR_CODE"
 }
}
```

## Security Features

- JWT-based authentication
- Request rate limiting
- Input sanitization
- XSS protection
- CORS configuration
- Secure password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request
