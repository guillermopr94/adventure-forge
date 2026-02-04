# Adventure Forge

An AI-powered interactive storytelling platform where players can "choose their own adventure" with dynamically generated narratives and images.

## 🚀 Overview

Adventure Forge leverages advanced Large Language Models (LLMs) and image synthesis to create unique, high-fidelity role-playing experiences. The platform is designed with a focus on modularity, allowing for the rapid addition of new genres, themes, and game rules.

## 🛠️ Technical Features

- **Dynamic Narrative Engine:** Powered by Google GenAI (Gemini) to craft responsive and immersive stories.
- **AI Image Generation:** Integrated synthesis of visual content to match the evolving story context.
- **Provider Fallback System:** A custom-built resilience layer that automatically switches between AI providers to ensure service availability and cost-optimization.
- **Persistence Layer:** Secure game state management using MongoDB, allowing players to resume adventures seamlessly.
- **Authentication:** Integrated Google OAuth for secure and streamlined user access.

## 🏗️ Architecture

- **Frontend:** React + TypeScript with a focus on a dynamic, responsive user interface.
- **Backend:** NestJS (Node.js) architected for scalability and maintainable service integration.
- **Database:** MongoDB for flexible schema-less data storage.
- **Deployment:** Frontend hosted on GitHub Pages with automated CI/CD flows.

## 🌍 Live Demo

[Explore the Forge](https://guillermopr94.github.io/adventure-forge/)

## 🔧 Local Development Setup

### Prerequisites
- Node.js v16+ and npm
- Google Cloud Project with OAuth 2.0 configured

### Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create or select a project
   - Navigate to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID (Web application)
   - Add `http://localhost:3000` to Authorized JavaScript origins
   - Add `http://localhost:3000` to Authorized redirect URIs
   - Copy the Client ID and paste it into `.env`:
     ```
     REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
     ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

### Security Note
⚠️ **Never commit `.env` files to version control.** The `.env` file is already in `.gitignore` to prevent accidental exposure of secrets.
