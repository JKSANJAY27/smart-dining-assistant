# Spice Garden — AI-First Smart Dining Assistant 🍷🍽️

Spice Garden is a full-stack, state-of-the-art **AI-First Smart Dining Assistant** designed for modern restaurant and café environments. Instead of a traditional, static digital menu ordering application with a simple chatbot widget, Spice Garden establishes **AI as the primary interaction layer** where Zara (the AI Sommelier & Host) proactively collaborates with diners in real-time, personalizes dish recommendations, suggests beverage pairings, handles dietary requests, and orchestrates co-diner group carts.

---

## 🎨 Design System: Saffron & Sunset Candlelight

The frontend moves away from cold, cramped developer-like dark grids into a **warm gastronomic luxury fine-dining ambiance**:
* **Gastronomic Backdrop**: Rich coppery chocolate-slate tones (`hsl(30, 16%, 6%)`) and warm candle-lit surface overlays (`hsl(30, 12%, 10%)`).
* **Sunset Saffron Accents**: Appetizing amber and hot saffron sunburst gradients (`from-amber-400 via-orange-500 to-rose-600`).
* **Luxurious Spacing**: Spacious 2-column digital grids that completely eliminate card squishing or item name truncations.
* **Ambient Candleglows**: Soft, glowing radial warm orange candlelight projections in the background.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    %% Client Tier
    subgraph Client ["Client Side (Next.js PWA Client)"]
        UI["App UI (Table Seating Card / Digital Grid)"]
        Zara["Zara Sommelier (Chat & Streaming Audio)"]
        Cart["Shared Table Cart (Group Ordering)"]
    end

    %% Gateway / Server
    subgraph Server ["Next.js Server & APIs"]
        Router["App Router Routing Layer"]
        SSE["SSE Stream Controller (/api/session/.../ai/stream)"]
        SocketServer["WebSocket server (Socket.io)"]
        
        subgraph Agents ["Zara AI Agents Orchestrator"]
            Greeter["Greeter Agent"]
            NLU["NLU Intent Agent"]
            Somm["Sommelier & Recommendation Agent"]
            Upsell["Dynamic Upsell Agent"]
            GroupCoord["Group Coordinator Agent"]
            Validator["Kitchen Order Validator"]
        end
    end

    %% State & Storage
    subgraph Database ["Persistence & State Layer"]
        Supabase["Supabase PostgreSQL"]
        Prisma["Prisma ORM Client"]
        Redis["Upstash Redis (Group Cart Session cache)"]
        VectorDB["Chroma Vector Database (Semantic Menu Search)"]
    end

    %% AI Model Tier
    subgraph Gemini ["Google Gemini AI"]
        Model["Gemini Pro Model Engine"]
    end

    %% Connections
    UI <--> Router
    Zara <--> SSE
    Cart <--> SocketServer
    
    Router --> Agents
    SSE --> Agents
    Agents <--> Model
    Agents <--> VectorDB
    
    Router <--> Prisma
    Prisma <--> Supabase
    SocketServer <--> Redis
```

---

## 🗄️ Database Schema & Entities

The relational mapping is governed by Prisma inside PostgreSQL:
* **`MenuItem`**: High-fidelity records of plates (prices, allergens, tags, calories, spice indicators, and kitchen preparation times).
* **`Session`**: Tracks diners currently seated on a physical table, holding metadata constraints and guest counts.
* **`CartItem`**: Group-shared cart records linking co-diners adding dishes simultaneously.
* **`Order`**: Post-checkout kitchen receipts managing status tracks (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`).
* **`OrderItem`**: Line-item lists of purchased dishes with custom instructions.
* **`Message`**: Persisted conversation thread histories between guests and Zara.
* **`Complement`**: Self-referential menu items representing dynamic pairing recommendations.
* **`OtpVerification`**: Phone authentication codes and attempt tracking.

---

## 🚀 Key Functional Flows

### 1. Zero-Friction Seating
1. Dynamic QR Seating Cards printed by administration staff are placed on physical tables.
2. Diners scan the card (targets `/table/[tableId]`) to join the session.
3. Zara greets them, registers their names, and merges their mobile devices into a single group-sync cart.

### 2. Primary AI Sommelier Zara
* Conversational natural language menu filter sweeps ("I want something light and highly spicy for starters").
* Dynamic, real-time sommelier pairings based on cart entries (e.g. suggesting custom beverage vintages for active plates).
* Server-Sent Events (SSE) streaming responses with somatic waveform voice spectral feedback.

### 3. Secure Verification & Checkout
1. When checking out, the guest reviews their subtotal + 5% service GST, enters their name and mobile number.
2. An OTP is simulated and securely logged to the server terminal console.
3. The guest enters the 6-digit OTP code which is checked against a cryptographic SHA-256 hash in Prisma.
4. On success, a database transaction creates the order, clears the session cart, sends a print command to the kitchen, and renders a live wait-time progress bar.

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+**, **npm**, and a PostgreSQL database (e.g. Supabase) ready.

### 2. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
# Database Connection
DATABASE_URL="postgresql://postgres.ibqwyxwlxpjlfehjynfj:smart-dining1@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

# AI Model Keys
GEMINI_API_KEY="your-gemini-key"

# Redis Cache for group websocket synchronizations
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Branding Constants
NEXT_PUBLIC_RESTAURANT_NAME="Spice Garden"
```

### 3. Setup and Run
```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Seed gourmet menu
npx prisma db seed

# Run local dev server
npm run dev
```

Open [http://localhost:3000/table/1](http://localhost:3000/table/1) to join table 1 as a customer, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the kitchen queue!
