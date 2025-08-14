# ft_transcendence

ft_transcendence is a full-stack web application project that combines real-time chat, multiplayer gaming, user management, and social features. The project is containerized using Docker and orchestrated with Docker Compose for easy deployment and scalability.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Figma](#figma-link)

---

## Project Overview

ft_transcendence is designed as a modern web platform where users can:
- Register, authenticate (with 2FA), and manage their profiles
- Chat in real-time with other users
- Play multiplayer games (such as Pong) against other users or AI
- Add friends, view leaderboards, and track match history

The project is modular, with separate services for chat, game, and main application logic, all communicating via REST APIs and WebSockets.

---

## Features
- **User Authentication** (with optional 2FA)
- **Real-Time Chat** (private and group chats)
- **Multiplayer Game** (Pong, 1v1, AI, Tournament modes)
- **Friends System** (add, remove, suggestions)
- **Leaderboards & Match History**
- **Profile Management**
- **Responsive Frontend** (Next.js)
- **Dockerized Microservices**
- **Redis & SQLite Integration**

---

## Architecture

```
+-------------------+      +---------------------------+      +-------------------+
|    Frontend       | <--> |           Backend         | <--> |    Databases      |
|  (Next.js, React) |      |   (Node.js, TS,Fastify)   |      | (Redis, SQLite)   |
+-------------------+      +---------------------------+      +-------------------+
			|                        |                        |
			|                        |                        |
			+---- Docker Compose ----+------------------------+
```

- **frontend/**: Next.js app for UI
- **backend/**: Contains chat, game, and main services (Node.js/TypeScript)
- **nginx/**: Reverse proxy configuration
- **redis/**, **sqlite/**: Database containers

---

## Tech Stack
- **Frontend**: Next.js, React, Zustand, CSS Modules
- **Backend**: Node.js, TypeScript, Express, WebSocket, Fastify 
- **Databases**: Redis, SQLite
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx

---

## Setup & Installation

0. **conf the env**
    ```
        move the envbacke to the backend repo
        move the envfront to the frontend repo
    ````

1. **Clone the repository:**
	```sh
	git clone https://github.com/Mohcine-Ghalmi/ft_transcendence.git
	cd ft_transcendence
	```
2. **Build and start all services:**
	```sh
	make
	```
3. **Access the app:**
	- Frontend: https://localhost
	- Backend APIs

4. **(Optional) Clean up containers and images:**
	```sh
	make fclean
	```

---

## Usage
- Register a new account or sign in
- Enable 2FA for extra security (optional)
- Chat with friends or in groups
- Play games and climb the leaderboard
- Manage your profile and friend list

---

## Screenshots

>
![alt text](pages/image.png)
![alt text](pages/image-1.png)
![alt text](pages/image-2.png)
![alt text](pages/image-3.png)
![alt text](pages/image-4.png)
![alt text](pages/image-5.png)
![alt text](pages/image-7.png)
![alt text](pages/image-8.png)
![alt text](pages/image-9.png)
![alt text](pages/image-10.png)
![alt text](pages/image-11.png)
![alt text](pages/image-12.png)
![alt text](pages/image-13.png)
![alt text](pages/image-14.png)
![alt text](pages/image-15.png)
![alt text](pages/image-16.png)
![alt text](pages/image-17.png)
![alt text](pages/image-18.png)
![alt text](pages/image-20.png)
![alt text](pages/image-21.png)
![alt text](pages/image-22.png)

## FIGMA LINK :
https://www.figma.com/design/69GCBSgN44x25ICYJJY1p1/trans?node-id=0-1&t=wp9ud0I2UyFayoFK-1