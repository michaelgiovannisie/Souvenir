# 🌍 Souvenir

**Your personal travel journal, memories, and map — all in one place.**

Souvenir is a full-stack travel application that helps users document every place they've visited, organize trips, upload photos, save memorable moments, and visualize their journeys on an interactive world map. Instead of just tracking destinations, Souvenir lets you preserve the stories behind them.

---

## ✨ Features

### 🗺️ Interactive Travel Map
- Explore an interactive world map powered by Leaflet
- Pin every city, state, or country you've visited
- Zoom into destinations
- View your travel history geographically

### ✈️ Trip Management
- Create and organize trips
- Add destinations
- Record travel dates and trip duration
- Mark future destinations with a wishlist

### 📸 Travel Memories
- Upload photos from each trip (stored via Cloudinary)
- Write journal entries
- Save favorite memories with captions and notes
- Organize memories by location

### 📍 Places You've Visited
- Countries, States/Provinces, Cities
- National Parks, Landmarks, Beaches, Mountains

### 🎯 Bucket List
- Save dream destinations organized by country
- Mark completed trips and track travel goals

### 📊 Travel Statistics
- Countries and cities visited
- Total trips and continents
- Days traveled
- Favorite destination, longest trip, most visited country

### 🌤️ Destination Info
- Best season to visit
- Time zone
- Personal rating and notes

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Leaflet (interactive maps)

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- REST API

### Database
- PostgreSQL

### Authentication
- JWT

### Media Storage
- Cloudinary (photo uploads, resizing, thumbnails, CDN delivery)

### Deployment
- Docker
- GitHub Actions
- Render / Railway (future: AWS)

---

## 🏗️ Project Structure

```
souvenir/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/
│   └── public/
│
├── backend/
│   └── src/
│       └── main/
│           ├── java/com/souvenir/
│           │   ├── auth/
│           │   ├── trip/
│           │   ├── destination/
│           │   ├── memory/
│           │   └── user/
│           └── resources/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/souvenir.git
cd souvenir
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

---

## 🗂️ MVP Scope

The core loop to build first:

1. **Auth** — register, login, JWT session
2. **Trips** — create and view trips
3. **Destinations** — add destinations with map pins
4. **Memories** — upload photos and journal entries per trip

Everything else (bucket list, stats, weather, AI) is additive once this works.

---

## 🎯 Future Features

- AI travel journal summaries
- Collaborative trips and friend sharing
- Travel timeline
- Expense tracking
- Visa tracker
- Flight history
- Export travel diary to PDF
- Heatmap of visited locations
- Country completion percentage
- Travel achievements and badges
- World Wonders tracker
- Offline mode

---

## 🎯 Vision

Travel isn't just about checking countries off a list. Every destination has a story, every trip creates memories, and every journey becomes part of who we are. Souvenir is designed to be a lifelong digital scrapbook where travelers can preserve experiences, revisit memories, and celebrate the adventures they've had around the world.

---

## 📄 License

This project is licensed under the MIT License.
