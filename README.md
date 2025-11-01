# KDramaHub

Welcome to KDramaHub: cozy and aesthetic web app for all things K-Drama!  
Discover trending shows, search your favorites, manage your own watchlist, and even get AI-powered drama recommendations based on your preferences

## Features

- **Search & Browse:** Explore real-time K-Drama data from the **TMDB API** (API key pre-configured).
- **Personalized Watchlist & Favorites:** Save dramas you love or plan to watch.
- **Profile Management:**
  - Update password
  - Delete profile
  - Set sound and animation preferences
- **AI Recommendations (Gemini):**  
  Take a quiz, describe your K-Drama tastes, and get intelligent recommendations.  
  \_(You’ll need your own Gemini API key, free keys are configured in Google AI Studio).
- **Detailed Drama Info:** Click any drama card to see synopsis, ratings, and similar dramas.
- **Sounds & Animations:** Smooth transitions, cozy effects, and ambient sounds for the perfect viewing vibe.

## Tech Stack

### Frontend

- **Vite + React.js**
- **standard HTML, CSS and JS**
- **SessionStorage** for preferences

Runs on: http://localhost:5173/

### Backend

- **ASP.NET Core**
- **Entity Framework Core**
- **SQL Server** for user data base,
  Connection String (SQL Server):
  "ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=UserAppDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
- **Argon2id** for user passwords hashing
- **xUnit** for tests

Runs on: http://localhost:7147/

### AI Feature: Gemini Integration

KDramaHub integrates Google Gemini 2.5 Flash for personalized K-Drama recommendations.

## SETUP Guide

Getting Started (Full Setup Guide)

Follow these steps to run KDramaHub locally.

1. Clone the repository
   git clone https://github.com/milicatesic7/kdramahub.git
   cd kdramahub

2. Create and connect your database that will store all the user information

Database Name: UserAppDB
Tables: dbo.Users (Int Id, Varchar Name, Varchar Email, Varchar Password),
dbo.Favorites (Int Id, Int UserId, Int DramaId),
dbo.Watches (Int Id, Int UserId, Int DramaId)
Tech: SQL Server, connected with localhost
Stores users, favorites, watchlists, and preferences.

3. Setup the Backend (ASP.NET + SQL Server)
   Prerequisites:

Visual Studio 2022+
.NET 8 SDK
SQL Server

Steps

Open the backend project folder in Visual Studio.

Update your appsettings.json connection string if necessary:

"ConnectionStrings": {
"DefaultConnection": "Server=localhost;Database=UserAppDB;Trusted_Connection=True;TrustServerCertificate=True;"
}

Run database migrations:
dotnet ef database update
dotnet add package DotNetEnv

Create your own .env file with your Gemini Api Key, see .env.example

Start the backend:
Press F5 in Visual Studio, or

Run:
dotnet run

The API should now be running on:
http://localhost:7147/

4. Setup the Frontend (Vite + React)
   Prerequisites
   Node.js
   (v18+ recommended)
   npm
   (comes with Node)

Steps

Navigate to the frontend folder:
cd kdramahub-frontend

Install dependencies:
npm install

Start the app:
npm run dev

Open your browser at:
http://localhost:5173/
