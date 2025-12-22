# Babi Web Backend

Backend API for Babi Web using Node.js, Express, and MongoDB Atlas.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Edit `.env` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/babi-web?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key
   SECRET_PASSWORD=communication
   ```

3. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with secret password
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user (protected)

### Images
- `GET /api/images/babiii` - Get all Babiii gallery images
- `GET /api/images/moments` - Get all Moments gallery images
- `GET /api/images/letter` - Get love letter image
- `POST /api/images` - Upload new image (protected)
- `PUT /api/images/:id` - Update image (protected)
- `DELETE /api/images/:id` - Delete image (protected)

### Health Check
- `GET /api/health` - Check if API is running

## Database Seeding

To populate the database with initial image data:
```bash
node seed.js
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Replace the placeholder in `.env`

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing
