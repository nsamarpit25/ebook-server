# Book Store API

A full-stack book store application with comprehensive features for users and authors, built with modern technologies.

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

- 🔐 Secure authentication system
- 📚 Browse and purchase books
- ⭐ Rate and review books
- 📖 Track reading progress
- 🛒 Shopping cart management
- 💳 Secure payment processing

### Author Features

- ✍️ Author registration and verification
- 📝 Book creation and management
- 📊 Sales analytics
- 💰 Earnings tracking
- 📨 Communication with readers

### Admin Features

- 👥 User management
- 📚 Content moderation
- 💳 Payment oversight
- 📊 Platform analytics

## API Documentation

### Authentication

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | /auth/generate-link | Generate auth link |
| GET    | /auth/verify        | Verify auth token  |
| GET    | /auth/profile       | Get user profile   |
| POST   | /auth/logout        | Logout user        |
| PUT    | /auth/profile       | Update profile     |

### Author Routes

- **POST /author/register**: Register as an author
- **PATCH /author/**: Update author details
- **GET /author/:id**: Get author details

### Book Routes

- **POST /book/create**: Create a new book
- **PATCH /book/**: Update book details
- **GET /book/list**: Get all purchased books
- **GET /book/details/:slug**: Get book public details
- **GET /book/by-genre/:genre**: Get books by genre
- **GET /book/read/:slug**: Generate book access URL
- **GET /book/recommended/:bookId**: Get recommended books

### Cart Routes

- **POST /cart/**: Update cart
- **GET /cart/**: Get cart details
- **POST /cart/clear**: Clear cart

### Checkout Routes

- **POST /checkout/**: Checkout cart
- **POST /checkout/instant**: Instant checkout

### Order Routes

- **GET /order/**: Get all orders
- **GET /order/check-status/:bookId**: Check order status
- **POST /order/success**: Get order success status

### Review Routes

- **POST /review/**: Add a review
- **GET /review/:bookId**: Get user review for a book
- **GET /review/list/:bookId**: Get public reviews for a book

### History Routes

- **POST /history/**: Update book reading history
- **GET /history/:bookId**: Get book reading history

### Webhook Routes

- **POST /webhook/**: Handle Stripe payment webhook

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features

- JWT-based authentication
- Request rate limiting
- Input sanitization
- XSS protection
- CORS configuration
- Secure password hashing

## Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request
