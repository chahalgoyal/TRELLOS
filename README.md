# Trello Clone 📝

A full-stack Kanban board application inspired by Trello. This project allows users to create boards, add lists, and manage cards with full drag-and-drop functionality to streamline task management and productivity.

## ✨ Features

- **Full Drag-and-Drop functionality**: Seamlessly move cards between lists and reorder lists using `@dnd-kit`.
- **Boards Management**: Create, update, star, archive, and delete boards.
- **Lists & Cards**: Create infinite lists per board and populate them with task cards.
- **Card Details**: Add labels, checklist items, attachments, and comments to individual cards.
- **Responsive Design**: Beautiful, mobile-friendly UI that works seamlessly across desktops, tablets, and smartphones.
- **Real-time Persistence**: All changes are instantly synced and saved to the PostgreSQL database.

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- `@dnd-kit` (for complex drag and drop workflows)
- React Router DOM
- Vanilla CSS (Responsive & Modern)

**Backend:**
- Node.js & Express.js
- PostgreSQL (`pg`)
- RESTful API Architecture
- CORS & security configured for secure client-server communication.

**Infrastructure:**
- Frontend: `https://trellos.goyal.me` 
- Backend: AWS EC2 Instance with Nginx (`https://api.goyal.me`)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Local or Cloud like Supabase)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with your database string:
   ```env
   DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
   PORT=5001
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

## 📦 Deployment

**Frontend:**
The React application is built via Vite and deployed at [https://trellos.goyal.me](https://trellos.goyal.me).

**Backend:**
The Node.js server is hosted on an **AWS EC2 instance**. It uses **Nginx** as a reverse proxy to route traffic securely, and is accessible fully over HTTPS via a custom domain (`https://api.goyal.me`).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the ISC License.
