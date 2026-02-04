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

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Cloud Project with OAuth 2.0 credentials

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/guillermopr94/adventure-forge.git
   cd adventure-forge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized JavaScript origins: `http://localhost:5173`
   - Copy the Client ID to `.env`:
     ```
     REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Security Note

**Never commit your `.env` file to version control.** The `.env.example` file contains placeholder values for reference. Keep your actual credentials private.
