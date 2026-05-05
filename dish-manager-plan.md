# Dish Manager — Project Plan

A personal desktop app to manage dishes, ingredients, and cooking videos. Built with Laravel + React + Electron.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop shell | Electron | Wraps the app into a `.exe` installer |
| Frontend | React (Vite) | UI — dish list, detail view, forms |
| Backend | Laravel | Local REST API on `localhost:8000` |
| Database | SQLite | Single file on disk, zero setup |
| HTTP client | Axios | React ↔ Laravel communication |
| Video | YouTube embed | Store URL, render as `<iframe>` |

---

## Folder Structure

```
dish-manager/
├── backend/              # Laravel project
│   ├── app/Models/
│   │   ├── Dish.php
│   │   └── Ingredient.php
│   ├── database/migrations/
│   ├── routes/api.php
│   └── .env              # DB_CONNECTION=sqlite
│
├── frontend/             # React (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DishList.jsx
│   │   │   ├── DishDetail.jsx
│   │   │   └── DishForm.jsx
│   │   ├── components/
│   │   │   ├── IngredientList.jsx
│   │   │   └── VideoEmbed.jsx
│   │   └── api/axios.js
│   └── vite.config.js
│
└── electron/             # Electron wrapper
    ├── main.js           # App entry, starts PHP server
    ├── preload.js
    └── electron-builder.yml
```

---

## Database Schema

### `dishes` table

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `name` | string | e.g. "Coq au Vin" |
| `category` | string | e.g. "Lunch", "Dinner" |
| `photo_path` | string | Local file path |
| `video_url` | string | YouTube URL |
| `notes` | text | Optional |
| `created_at` | timestamp | Auto |

### `ingredients` table

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `dish_id` | integer | Foreign key → dishes |
| `name` | string | e.g. "Chicken" |
| `quantity` | string | e.g. "200" |
| `unit` | string | e.g. "g", "pcs", "tbsp" |
| `notes` | text | Optional |

---

## API Routes

```
GET    /api/dishes                    → list all dishes
POST   /api/dishes                    → create a dish
GET    /api/dishes/{id}               → get dish + ingredients
PUT    /api/dishes/{id}               → update a dish
DELETE /api/dishes/{id}               → delete a dish

GET    /api/dishes/{id}/ingredients   → list ingredients
POST   /api/dishes/{id}/ingredients   → add ingredient
PUT    /api/ingredients/{id}          → update ingredient
DELETE /api/ingredients/{id}          → delete ingredient
```

---

## Screens

### 1. Dish List
- Grid/list of all dishes with photo thumbnails
- Search bar to filter by name or category
- "Add new dish" button → goes to form

### 2. Dish Detail
- Dish name, category, photo
- Full ingredients list (name, quantity, unit)
- Embedded YouTube video (`<iframe>`)
- Edit and Delete buttons

### 3. Add / Edit Form
- Fields: name, category, photo upload, video URL
- Dynamic ingredient rows (add/remove)
- Save button → POST or PUT to API

---

## Video Embedding

Store the YouTube URL as-is in the database. On the detail screen, convert it to an embed URL:

```js
// Convert: https://www.youtube.com/watch?v=ABC123
// To:      https://www.youtube.com/embed/ABC123

function getEmbedUrl(url) {
  const id = new URL(url).searchParams.get('v');
  return `https://www.youtube.com/embed/${id}`;
}
```

Render it as:
```jsx
<iframe
  width="100%"
  height="315"
  src={getEmbedUrl(dish.video_url)}
  allowFullScreen
/>
```

---

## Electron — Auto-starting Laravel

In `electron/main.js`, spawn the PHP server when the app opens:

```js
const { spawn } = require('child_process');
const path = require('path');

let phpServer;

function startLaravel() {
  phpServer = spawn('php', ['artisan', 'serve', '--port=8000'], {
    cwd: path.join(__dirname, '../backend'),
    shell: true,
  });
}

app.whenReady().then(() => {
  startLaravel();
  createWindow();
});

app.on('before-quit', () => {
  if (phpServer) phpServer.kill();
});
```

---

## Build Steps

### 1. Laravel setup
```bash
cd backend
composer install
cp .env.example .env
# Set DB_CONNECTION=sqlite in .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2. React setup
```bash
cd frontend
npm install
npm run dev       # development
npm run build     # production build → dist/
```

### 3. Electron setup
```bash
cd electron
npm install electron electron-builder --save-dev
# Point Electron to frontend/dist/index.html
npm run build     # produces installer .exe
```

---

## Build Order (Recommended)

1. **Laravel** — migrations, models (`Dish`, `Ingredient`), API routes
2. **Test API** — use Postman or curl to verify all endpoints
3. **React** — build dish list → detail → form screens
4. **Wire up** — connect React to Laravel via Axios
5. **Electron** — wrap, test as desktop app, then build `.exe`

---

## Sample Dishes (from your menu sheet)

| Dish | Category | Key Ingredients |
|---|---|---|
| Coq au Vin | Lunch (Monday) | Chicken, potato, rice, veg |
| Beef Goulash | Lunch (Tuesday) | Beef, fried potato, veg |
| Pork Schnitzel | Lunch (Wednesday) | Pork, mash potato |
| Roast Duck | Lunch (Thursday) | Duck, orange sauce, potato |
| Lamb Ragout | Lunch (Friday) | Lamb, potato, veg |
| Salmon Fillet | Dinner (Friday) | Salmon, dill sauce, couscous |
| Spaghetti Bolognese | Dinner (Saturday) | Spaghetti, beef mince |
| Tenderloin Steak | Lunch (Sunday) | Steak, fries, veg |

---

## Notes

- No internet required to run the app (except for loading YouTube videos)
- All data stays on your machine in a local SQLite file
- You can back up your data by copying the `database/database.sqlite` file
- Your i5-6300U / 8GB RAM is more than enough for this stack
