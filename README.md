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
