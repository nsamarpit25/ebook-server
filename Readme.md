# Book Store API

This is a full-stack book store application built with Node.js, Express, TypeScript, and MongoDB. The application allows users to browse, purchase, and review books. Authors can register and manage their books.

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for Node.js
- **TypeScript**: Typed superset of JavaScript
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling tool
- **Stripe**: Payment processing
- **Cloudinary**: Cloud storage for images
- **Zod**: TypeScript-first schema declaration and validation library

## Features

- User authentication and authorization
- Author registration and book management
- Book browsing and purchasing
- Book reviews and ratings
- Order management
- Payment processing with Stripe
- File uploads with Cloudinary

## API Endpoints

### Auth Routes

- **POST /auth/generate-link**: Generate authentication link
- **GET /auth/verify**: Verify authentication token
- **GET /auth/profile**: Get user profile
- **POST /auth/logout**: Logout user
- **PUT /auth/profile**: Update user profile

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

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUD_NAME`
   - `CLOUD_API_KEY`
   - `CLOUD_API_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `MAILTRAP_TEST_USER`
   - `MAILTRAP_TEST_PASS`
   - `VERIFICATION_LINK`
   - `AUTH_SUCCESS_URL`
   - `PAYMENT_SUCCESS_URL`
   - `PAYMENT_CANCEL_URL`
   - `BOOK_API_URL`
4. Start the development server: `npm run dev`

## License

This project is licensed under the MIT License.
