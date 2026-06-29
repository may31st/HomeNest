# HomeNest (Formerly RentHouse) - Smart Room Rental Management & Search Platform

HomeNest is a modern, smart room and apartment rental management and search platform. The project integrates advanced features including an AI Chatbot Assistant (using LLM with Retrieval-Augmented Generation - RAG), distance/geographical search (OpenStreetMap Geocoding), online deposit payments via the VNPAY gateway, and real-time messaging between landlords and tenants.

---

## 📌 Key Features

### 1. For Tenants (Users)
*   **Smart Search:** Search rooms by multiple criteria (price range, district/city, bedrooms/bathrooms count, room type, and amenities such as washing machine, air conditioner, private landlord, etc.).
*   **Distance-Based Search:** Find rooms around a specific address within a selected radius (e.g., search within 3km of a university). The system automatically converts addresses into geographical coordinates (Geocoding) to calculate actual distances.
*   **Favorites List:** Save interesting listings to a personalized favorites page for quick access.
*   **Real-time Chat:** Chat directly with landlords using instant messaging powered by Socket.IO.
*   **Online Deposit:** Securely pay booking deposits online via the integrated VNPAY payment gateway.
*   **E-Contracts:** View and track lease terms and agreements created online by the landlord.

### 2. For Landlords / Admins (Owners)
*   **Post & Manage Listings:** Post detailed room descriptions, pricing, area, coordinates, images, bedrooms/bathrooms count, room types, and amenities.
*   **Owner Dashboard:** Track total rooms, manage listings, view booking states, and approve rental deposits.
*   **Contract Management:** Draft and manage lease agreements online for users who successfully pay the deposit.
*   **Messaging System:** Respond to tenant queries instantly within the chat interface.

### 3. AI Chatbot Assistant
*   **Omnipresent Widget:** Access the Chatbot widget from any page on the platform.
*   **Natural Language Processing (Vietnamese):** Detect user intent for room searches, amenities, location, distance, and query matching listings from the database.
*   **Process Guidance:** Instant replies to frequently asked questions about booking steps, posting guidelines, contract terms, deposit policies, and refund rules on HomeNest.
*   **Large Language Model (LLM):** Powered by OpenRouter API using advanced LLMs (defaulting to `gemma-3-12b-it:free`) with local rule-based fallbacks.

### 4. Data Crawler
*   **Automated Scraper:** Puppeteer scripts to scrape real-world rental listings from popular property websites, categorized by room types.
*   **Data Importer:** Automatically cleans addresses, geocodes coordinates, and seeds the MySQL database.

---

## 🛠️ Technology Stack

### Frontend
*   **Core:** React.js, JavaScript (ES6+), React Router DOM (v6)
*   **Styling & UI Components:** Tailwind CSS, Ant Design (Antd), Material-UI (MUI), FontAwesome
*   **State Management:** Redux, Redux Persist (automatic session/state persistence)
*   **Real-time & Interactions:** Socket.io-client, Swiper, Axios

### Backend
*   **Runtime:** Node.js & Express.js
*   **Database & ORM:** Sequelize CLI, MySQL2 (relational database connection)
*   **Real-time Server:** Socket.IO
*   **Payment Gateway:** VNPAY SDK
*   **Security & Utilities:** JWT (JSON Web Tokens), Bcrypt (password hashing), Multer (file upload), Puppeteer (scraping)

### AI Chatbot (Python ChatBot Service)
*   **Framework:** Flask
*   **NLP & Vector Database:** LangChain, ChromaDB, FAISS, Sentence-Transformers, Underthesea (Vietnamese NLP word segmentation)
*   **Embedding Model:** Semantic embeddings optimized for Vietnamese search queries to perform Retrieval-Augmented Generation (RAG).

---

## 📂 Project Structure

```text
Renthouse/                  # Project root directory
├── backend/                # Node.js & Express API server
│   ├── config/             # Database & Sequelize configurations
│   ├── controllers/        # API business logic handlers (Auth, Room, Payment...)
│   ├── crawl_data/         # Puppeteer scraper scripts & sample JSON data
│   ├── middlewares/        # Authentication (JWT) & authorization middleware
│   ├── models/             # Sequelize MySQL models
│   ├── routes/             # Express routes (/api/auth, /api/room, /api/v1/chatbot...)
│   ├── index.js            # Server entrypoint
│   └── package.json        # Backend package list & scripts
│
├── frontend/               # React.js client application
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── api/            # Axios API client modules
│   │   ├── chat/           # Socket.io client setup & UI
│   │   ├── components/     # Shared components (Header, Footer, Chatbot widget...)
│   │   ├── views/          # Pages (Landing, Home, RoomList, Detail, Dashboard, Payments...)
│   │   └── App.js          # App routing
│   └── package.json        # Frontend package list & scripts
│
└── ChatBot/                # Python RAG Chatbot Service
    ├── chromaDB/           # Vector database files for embeddings
    ├── training_data/      # LLM response history & logs
    ├── requirements.txt    # Python requirements
    ├── app.py              # Flask server entrypoint (port 5001)
    └── routes.py           # Handles routing and subprocess LLM queries
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
*   **Node.js** (Recommended v18.x or higher)
*   **Python** (Recommended v3.9 or higher) along with `pip`
*   **MySQL** Database server (installed and running locally)

---

### 2. Backend Setup & Run

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Create your local configuration environment file:
    ```bash
    cp .env.example .env
    ```
4.  Open `.env` and fill in your local MySQL credentials, VNPAY configurations, and OpenRouter API key:
    ```env
    PORT=8000
    NODE_ENV=development
    JWT_SECRET=super_secret_jwt_key_renthouse
    DB_USER=root
    DB_PASS=your_mysql_password
    DB_NAME=renthouse
    DB_HOST=127.0.0.1
    VNP_TMNCODE=your_vnpay_tmncode
    VNP_HASHSECRET=your_vnpay_hashsecret
    OPENROUTER_KEY=your_openrouter_api_key
    ```
5.  Create the MySQL database (automatically matches database name in `.env` if not present):
    ```bash
    node create_db.js
    ```
6.  Synchronize the database models and run the backend server in development mode:
    ```bash
    npm start
    ```
    *The backend server runs at `http://localhost:8000`. Models are auto-synchronized with the DB.*

7.  *(Optional)* Create a default Admin user for testing the Dashboard:
    ```bash
    node create_admin_user.js
    ```
    *Default credentials: Email: `admin@gmail.com` | Password: `Admin123`*

8.  *(Optional)* Scrape sample data and import to MySQL:
    ```bash
    # Scrapes real-world rooms to JSON:
    npm run crawl
    
    # Imports the JSON data to the MySQL database:
    npm run import-data
    ```

---

### 3. Frontend Setup & Run

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```
    *Open `http://localhost:3000` in your web browser to access the website.*

---

### 4. Python Chatbot Service Setup & Run

1.  Navigate to the ChatBot directory:
    ```bash
    cd ../ChatBot
    ```
2.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file in the `ChatBot` directory and add your OpenRouter API Key:
    ```env
    OPENROUTER_KEY=your_openrouter_api_key
    ```
4.  Start the Flask server:
    ```bash
    python app.py
    ```
    *The Python Chatbot service will run at `http://localhost:5001`.*

---

## 🔒 License
This project is developed for educational and research purposes. Source code is owned by the contributors and distributed under the ISC/MIT License.
