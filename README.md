# Dish Manager (Personal Cooking System)

A desktop application to manage your personal recipes, built with Laravel, React, and Electron.

## Tech Stack
- **Backend:** Laravel (REST API, SQLite)
- **Frontend:** React (Vite, Tailwind CSS, Axios, Lucide Icons)
- **Desktop Wrapper:** Electron

## Prerequisites
- **PHP 8.2+** (with SQLite extension enabled)
- **Composer**
- **Node.js & npm**

## Getting Started

### 1. Installation
Install dependencies for all components:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed

# Frontend dependencies
cd ../frontend
npm install

# Electron dependencies
cd ../electron
npm install
```

### 2. Running in Development
You can start the entire stack (Laravel, React Dev Server, and Electron) with a single command from the root folder:

```bash
npm run dev
```

### 3. Building for Production
To build the frontend and package the Electron application:

```bash
npm run build:electron
```
The portable executable will be generated in the `electron/dist` folder.

## Features
- **Dish Management:** CRUD operations for your favorite meals.
- **Dynamic Ingredients:** Add, edit, or remove ingredients per dish.
- **Video Integration:** Embed YouTube tutorials directly in the dish detail view.
- **Search & Filter:** Easily find dishes by name or category.
- **Local Storage:** Everything is stored locally on your machine using SQLite.
