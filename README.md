# Spice Garden — AI-First Smart Dining Assistant 🍷🍽️

Spice Garden is a full-stack, state-of-the-art **AI-First Smart Dining Assistant** designed for modern luxury restaurant and café environments. Instead of a traditional, static digital menu ordering application with a simple chatbot widget, Spice Garden establishes **AI as the primary interaction layer** where Zara (the AI Sommelier & Host) proactively collaborates with diners in real-time, personalizes dish recommendations, suggests beverage pairings, handles dietary requests, and orchestrates co-diner group carts.

---

## 🔗 Live Demo & Walkthrough Video

* **Live Demo Web Interface**: [http://localhost:3000/table/1](http://localhost:3000/table/1) (Seated at Table 1)
* **Loom Walkthrough Video**: [Spice Garden Video Tour (Loom Mock)](https://loom.com/share/spice-garden-ai-first-dining-concierge-walkthrough)

---

## ⚡ Setup Instructions (Run Locally in < 5 Steps)

Get Spice Garden running in under 2 minutes with these simple steps:

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory and add the following keys (using your Google Gemini and Upstash Redis keys):
```env
# Database Connection (Supabase PostgreSQL Free Tier)
DATABASE_URL="postgresql://postgres.ibqwyxwlxpjlfehjynfj:smart-dining1@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

# AI Model Keys (Google AI Studio Free API Key)
GEMINI_API_KEY="your-gemini-api-key"

# Redis Cache for group websocket and embeddings synchronization
UPSTASH_REDIS_REST_URL="https://premium-mustang-38435.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# Branding Constants
NEXT_PUBLIC_RESTAURANT_NAME="Spice Garden"
AI_TEMPERATURE="0.7"
```

### 3. Push Database Schema & Seed Gourmet Menu
Synchronize the PostgreSQL schema via Prisma and seed the database with over 50+ detailed gourmet dishes (including prep times, allergens, ratings, and pairings):
```bash
npx prisma db push
npx prisma db seed
```

### 4. Boot the Server
Start the Next.js development server integrated with custom WebSockets:
```bash
npm run dev
```

### 5. Launch the Experience
- **Customer Dining Interface**: Open [http://localhost:3000/table/1](http://localhost:3000/table/1) to scan Table 1.
- **Kitchen & Admin Dashboard**: Open [http://localhost:3000/admin](http://localhost:3000/admin) to view the kitchen orders queue, live sessions, and generate printable seating cards.

---

## 🏗️ System & WebSockets Group Sync Architecture

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
        VectorDB["In-Process Vector Store (Semantic Cache)"]
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

## 🧠 Zara Multi-Agent Architecture & Tool Matrix

Zara is powered by **8 specialized AI agents** that run concurrently to deliver context-aware, personalized, and safe hospitality services.

```
                  ┌───────────────────────────────┐
                  │      Master Orchestrator      │
                  └───────────────┬───────────────┘
                                  │
      ┌───────────────┬───────────┼───────────┬───────────────┐
      ▼               ▼           ▼           ▼               ▼
┌───────────┐   ┌───────────┐┌───────────┐┌───────────┐ ┌───────────┐
│  Greeter  │   │  NLU /    ││Sommelier /││ Sentiment │ │   Group   │
│  Agent    │   │  Translate││Recommend  ││   Agent   │ │Coordination
└───────────┘   └───────────┘└───────────┘└───────────┘ └───────────┘
```

### 1. Master Orchestrator (`orchestrator.ts`)
- **Role**: Coordinates the entire communication pipeline, manages state, sequences execution, and combines outputs into a clean client-ready package.
- **NLU / Routing Tools**: Resolves intent, retrieves recent chat history, and triggers specialized agent sub-tasks.

### 2. Onboarding & Greeter Agent (`greeterAgent.ts`)
- **Role**: Warmly welcomes guests and guides them through a 2-step visual preference flow (moods, diet limitations).
- **Onboarding Tools**: `update_preference`, `get_session_context` to persist choices into Upstash Redis session cache.

### 3. Multilingual NLU & Translation Agent (`multilingualAgent.ts`)
- **Role**: Normalizes multi-dialect and Hinglish/local phrasing (e.g. *"Spicy starters aur cool raita suggest karo"*) into clean semantic queries.
- **NLU Tools**: Normalizes syntax and extracts food search tokens.

### 4. Sommelier & Recommendation Agent (`recommendationAgent.ts`)
- **Role**: Matches cravings to catalog dishes using semantic search, providing descriptive, high-quality chef suggestions.
- **Search Tools**: `search_menu` (local Cosine Similarity on Gemini embeddings), `get_popular_items` (time-of-day analytics).

### 5. Context Memory State Agent (`contextMemoryAgent.ts`)
- **Role**: Dynamically updates customer profile attributes (dietary preferences, mood context) as the conversation moves.
- **Memory Tools**: `update_preference`, `get_session_context`.

### 6. Proactive Dynamic Upsell Agent (`upsellAgent.ts`)
- **Role**: Audits active cart contents and injects context-specific pairing upsells (e.g., suggesting garlic naan for rich gravy curries, or matching a cool beverage to hot spicy plates).
- **Upsell Tools**: `get_complementary` (checks catalog complements list).

### 7. Hospitality Sentiment Analysis Agent (`sentimentAgent.ts`)
- **Role**: Constantly audits diner inputs for signs of frustration or confusion.
- **Sentiment Tools**: Modifies the final response by prepending warm, empathetic, and reassuring apologies.

### 8. Co-Diner Group Coordinator Agent (`groupCoordinatorAgent.ts`)
- **Role**: Performs safety and conflict checks across all members at the table (e.g., warns a guest if they add a peanut-rich item while a co-diner has registered a peanut allergy).
- **Safety Tools**: `get_cart`, `get_session_context` (fetches co-diner safety metadata).

### 9. Kitchen Order Validation Agent (`orderValidationAgent.ts`)
- **Role**: Ensures items are in stock, validates quantities, and reviews business rules before accepting orders.
- **Validation Tools**: `validate_stock`, `create_order` (PRISMA transaction).

---

## 🎨 Design Decisions & Tech Stack Rationale

### 1. Next.js 14 / App Router & Monorepo
We built the entire full-stack app in Next.js 14 to leverage React Server Components for near-zero loading states and monorepo structure. Having API routes and Socket.io WebSockets inside the same server keeps deployment simple and reduces cold starts.

### 2. In-Process Vector Embeddings + Upstash Redis Cache
Rather than deploying heavy, paid vector databases like Pinecone, we engineered an **in-process cached vector store** inside `lib/ai/vectorStore.ts`. It pulls catalog records from PostgreSQL, generates embeddings with Gemini, caches them in Redis, and performs fast Cosine Similarity in-memory. This guarantees instant searches and is 100% free.

### 3. Saffron & Soft Cream Warm Culinary Theme
We discarded traditional dark cyberpunk overlays in favor of a luxurious, warm dining aesthetic (**#FAF7F2 base**, **#D97706 saffron accent**, **#FFFDF9 elevated cards**). This visual style mirrors a physical fine-dining candlelight setting, stimulating appetite and making food photos pop.

### 4. Socket.io WebSockets for Real-time Diner Sync
We integrated Socket.io to allow multiple devices to instantly sync their order lists. This means a family seated at Table 1 can scan the same card, see additions appear on their screens instantly, and view co-diner avatars in the header.

---

## ⚖️ Trade-offs & Future Extensions

### 1. In-Memory Vector Store vs. Persistent Vector Database
* **Trade-off**: For 50+ menu items, executing Cosine Similarity in-memory takes less than **2ms**. However, if the menu scales to 10,000 items, local search might slow down.
* **Future Extension**: We would integrate `pgvector` inside the existing Supabase instance as the catalog grows.

### 2. Simulated OTP Gateway
* **Trade-off**: To make testing free and frictionless, SMS verification uses a mock OTP logged to the server terminal console.
* **Future Extension**: Integrate the `MSG91` or `Twilio` client inside `api/otp/send/route.ts` for live OTP text delivery.

### 3. Web Speech Recognition vs. Server-side Whisper
* **Trade-off**: Voice input uses the HTML5 native Web Speech API which processes voice-to-text directly in the client browser, reducing backend cost to zero. However, accuracy varies on older browsers.
* **Future Extension**: Run deep-learning Whisper API models server-side for superior noise cancellation.

---

## 🌟 AI Golden-Path Prompt Examples

Here are 3 golden paths to test Zara's multi-agent conversational capabilities:

### 1. The Complex Search Cravings Path
- **Diner Prompt**: *"Show me vegetarian starters that are not too spicy, ideally under 200 calories"*
- **Zara response**:
  > *"I've updated the menu below to feature our light and healthy options! Try our **Cucumber Raita** — it is fresh, cooling, contains only 80 calories, and pairs beautifully with starters. Let me know if you would like me to add it to your ordering card!"*
- **Specialized Agents active**: Multilingual NLU (analyzes calories/diet), Vector Store Search (ranks items), Memory Agent (stores "veg-only" limit).

### 2. The Hinglish Food-Pairing Path
- **Diner Prompt**: *"Kuch hot spicy biryani aur uske sath paneer recommend karo"*
- **Zara response**:
  > *"Excellent choice! Our slow-cooked **Saffron Biryani** is bold and packed with authentic spices. To pair, I highly suggest our **Paneer Tikka** — the rich, creamy marinade balances the biryani's spice. 
  > 
  > ✨ **Sommelier's Suggestion**: Add our cool **Cucumber Raita** to perfect this combination!"*
- **Specialized Agents active**: NLU Normalizer (converts Hinglish tokens), Upsell Agent (triggers raita complements).

### 3. The Co-Diner Allergy Protection Path
- **User A (Diner A)**: Completes greeter modal onboarding indicating a severe **peanut allergy**.
- **User B (Diner B)**: Prompts Zara: *"Recommend a rich dessert for the table, maybe something with almonds or peanuts"*
- **Zara response**:
  > *"I've found some exquisite sweet finishes for you! Our **Shahi Tukda** is cardamon-infused, rich, and completely peanut-free. 
  > 
  > ⚠️ **Table Allergy Warning**: Please note that a diner at your table has registered a severe peanut allergy. I have filtered out all peanut-based sweets for safety."*
- **Specialized Agents active**: Group Coordinator (intercepts query, audits co-diner profile cache, and outputs warnings).

---

Developed with ❤️ for premium culinary dining experiences. Spice Garden, 2026.
