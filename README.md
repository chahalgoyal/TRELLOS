<div align="center">

<img src="./frontend/public/icons8-trello.svg" width="60" alt="Trellos Logo" />

# TRELLOS

### A production-grade Kanban board built from scratch.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-trellos.goyal.me-blue?style=for-the-badge&logo=vercel)](https://trellos.goyal.me)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com)
[![AWS](https://img.shields.io/badge/Deployed%20on-AWS-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)

</div>

---

> **Trellos** is a high-fidelity Trello clone engineered as a home assignment — built to demonstrate **full-stack architecture depth, production-grade UX, and zero compromise on engineering quality**. It isn't a tutorial rewrite. It's a complete, deployable product.

---

## 📸 Feature Walkthrough

### Home Page — Workspace & Board Management

![Home Page](./screenshots/home.png)

A workspace-centric home page featuring a **fixed sidebar** with workspace navigation, **starred boards** prominently at the top, and a responsive board grid. Boards display their custom backgrounds (images, gradients, or solid colors) as live previews. Every board can be right-click deleted from the home screen.

---

### Board View — Glassmorphism Kanban

![Board View](./screenshots/board.png)

The heart of the app. Each board renders as a full-viewport Kanban canvas with:
- **Custom image backgrounds** (Unsplash-powered)
- **Glassmorphism lists** — translucent, blurred list containers that layer beautifully over vivid backgrounds
- **Label chips** and **member avatars** visible directly on cards
- **Checklist progress**, **attachment counts**, and **due dates** as non-intrusive card metadata
- **Drag & Drop** powered by `@hello-pangea/dnd` for butter-smooth cross-list reordering

---

### Create Board Modal — Live Preview

![Create Board](./screenshots/create_board.png)

The "Create Board" flow is a multi-view modal with:
- **Live board preview** that updates instantly as you select backgrounds
- Curated **photo presets** (4 images) and **color/gradient presets** (5 swatches)
- A `···` button that navigates to an expanded **Photos / Colors sub-menu** with "View more" grids
- A **custom image URL** field for any Unsplash or public image link
- Real-time **title validation** — the input turns red with a friendly "👋 Board title is required" prompt

---

### Card Detail Modal — Everything in One Place

![Card Detail](./screenshots/card_modal_full.png)
![Card Detail (Live)](./screenshots/card_detail.png)

Clicking any card opens a **full-featured card modal** surfacing every dimension of work:

| Feature | Details |
|---|---|
| 🏷️ **Labels** | Color-coded tags (green, blue, orange, etc.) visible across the board |
| 👤 **Members** | Assign multiple team members with avatar display |
| 📅 **Due Dates** | Calendar-based date picker; displayed on the card face |
| 📝 **Description** | Full-text editor with live save |
| ✅ **Checklists** | Sub-task lists with a live progress bar (e.g., "50% · 2/4 done") |
| 📎 **Attachments** | Link-based attachments with URL and name |
| 💬 **Activity Log** | Real-time comments and movement history ("Rahul moved this from Sprint to Deployed") |
| 🖼️ **Cover Images** | Full-mode and top-mode covers — images, gradients, or colors |
| 🗂️ **Archive** | Archive cards (and lists) to a per-board archive panel, with restore/delete |

---

### Drag & Drop — Cross-List Reordering

![Drag and Drop](./screenshots/drag_drop.png)

Cards and lists are fully draggable using `@hello-pangea/dnd`. The list context menu appears on drag, showing available target columns. All positions are **persisted to the database** on drop — no state-only illusions.

---

## ✨ Full Feature List

### Boards
- ✅ Create boards with image, gradient, or solid color backgrounds
- ✅ Star / Unstar boards (starred boards appear at the top)
- ✅ Right-click context menu for quick board deletion
- ✅ Custom background images via Unsplash URL

### Lists
- ✅ Create, rename, delete, and reorder lists
- ✅ Custom list backgrounds (color, gradient, or image)
- ✅ Collapse lists to save horizontal space
- ✅ Archive lists (removed from board, restorable)

### Cards
- ✅ Create, edit, move, and delete cards
- ✅ Full-mode and top-mode card covers (image, gradient, color)
- ✅ Markdown-capable descriptions
- ✅ Drag cards across lists with live position persistence
- ✅ Archive cards per board with dedicated restore UI

### Card Details
- ✅ Labels with custom colors and names
- ✅ Member assignment with avatars
- ✅ Due date picker
- ✅ Interactive checklists with animated progress bar
- ✅ Link attachments with custom display names
- ✅ Comments with author and timestamp
- ✅ Full activity log (moves, edits, comments)

### UI / UX
- ✅ Dark theme throughout (`#1f1f21` background)
- ✅ Glassmorphism list styling
- ✅ Animated "Feature coming soon" toast notifications
- ✅ Mobile responsive — sidebar hidden at ≤768px
- ✅ Favicon + custom Trellos logo

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │  Sidebar.jsx │  │  Home.jsx     │  │  Board.jsx           │  │
│  │  (navigation)│  │  (board grid) │  │  (DnD + lists/cards) │  │
│  └──────────────┘  └───────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CardModal.jsx (labels, dates, checklists, activity)     │    │
│  └──────────────────────────────────────────────────────────┘    │
│  Styling: Vanilla CSS + CSS Variables (Glassmorphism + Dark UI)  │
└─────────────────────────────────────────────────────────────────┘
                              │  REST API  │
                              ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                  │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ boardController│  │listController│  │  cardController      │  │
│  └───────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  metaController (labels, members)  + CORS + dotenv        │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │  pg pool  │
                              ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                PostgreSQL (Supabase)                             │
│  boards · lists · cards · labels · members · card_labels        │
│  card_members · checklist_items · attachments · comments        │
│  activity_logs                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
boards          -- title, bg_type, bg_value, is_starred
  └─ lists      -- title, position, archived, is_collapsed, bg_type, bg_value
       └─ cards -- title, description, cover_type, cover_value, cover_mode,
                   due_date, archived, position
            ├─ card_labels      (many-to-many → labels)
            ├─ card_members     (many-to-many → members)
            ├─ checklist_items  (text, is_complete, position)
            ├─ attachments      (url, name)
            ├─ comments         (text, author_id, created_at)
            └─ activity_logs    (action_type, details JSONB, performed_by)
```

---

## 🚀 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, component model |
| **Styling** | Vanilla CSS + CSS Variables | No build overhead, full control |
| **Drag & Drop** | `@hello-pangea/dnd` | Accessible, maintained DnD |
| **Backend** | Node.js + Express | Minimal overhead REST API |
| **Database** | PostgreSQL (Supabase) | Relational integrity, real-time capable |
| **ORM** | `node-postgres` (raw SQL) | Fine-grained control, no ORM magic |
| **Deployment** | AWS EC2 + Netlify | Production separation of concerns |

---

## ⚡ Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (or a Supabase account)

### 1. Clone the repository

```bash
git clone https://github.com/chahalgoyal/TRELLOS.git
cd TRELLOS
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:5432/postgres
PORT=5001
```

Run database migrations:
```bash
node migrate.js
```

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Update `src/api.js` to point to `http://localhost:5001`.

### 4. Run Both Together

From the root directory:
```bash
npm run dev:all
```

Frontend → `http://localhost:5173`
Backend  → `http://localhost:5001`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/boards` | List all boards |
| `POST` | `/api/boards` | Create a board |
| `PATCH` | `/api/boards/:id` | Update board (star, rename, background) |
| `DELETE` | `/api/boards/:id` | Delete board |
| `POST` | `/api/boards/:id/lists` | Create a list |
| `PATCH` | `/api/lists/:id` | Update list (rename, collapse, background) |
| `DELETE` | `/api/lists/:id` | Delete list |
| `POST` | `/api/lists/:id/cards` | Create a card |
| `GET` | `/api/cards/:id` | Get full card detail |
| `PATCH` | `/api/cards/:id` | Update card |
| `PATCH` | `/api/cards/:id/move` | Move card to another list |
| `POST` | `/api/cards/:id/labels` | Add label to card |
| `POST` | `/api/cards/:id/checklist-items` | Add checklist item |
| `PATCH` | `/api/checklist-items/:id` | Toggle checklist item |
| `POST` | `/api/cards/:id/attachments` | Add attachment |
| `POST` | `/api/cards/:id/comments` | Add comment |
| `GET` | `/api/cards/:id/activity-log` | Get activity log |
| `GET` | `/api/labels` | Get all labels |
| `POST` | `/api/labels` | Create label |
| `GET` | `/api/members` | Get all members |

---

## 👤 Author

<div align="center">

**Chahal Goyal**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-chahalgoyal-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/chahalgoyal/)
[![GitHub](https://img.shields.io/badge/GitHub-chahalgoyal-181717?style=for-the-badge&logo=github)](https://github.com/chahalgoyal)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-trellos.goyal.me-4A90E2?style=for-the-badge&logo=vercel)](https://trellos.goyal.me)

</div>

---

<div align="center">
  <sub>Built with precision and purpose.</sub>
</div>
