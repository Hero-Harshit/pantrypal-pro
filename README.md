# 🍲 PantryPal Pro 🍲

```text
  _____             _cn_             _____       _ 
 |  __ \           | | |            |  __ \     | |
 | |__) |_ _ _ __ _| |_ _ __ _   _ | |__) |__ _| |
 |  ___/ _` | '_ \_   _| '__| | | ||  ___/ _` | |
 | |  | (_| | | | || | | |  | |_| || |  | (_| | |
 |_|   \__,_|_| |_||_| |_|   \__, ||_|   \__,_|_|
                              __/ |              
                             |___/               
```

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

### **Pantry to Plate, Perfected.**
**PantryPal Pro** is an AI-powered recipe discovery platform specifically crafted for the modern Indian home cook. By bridging the gap between "what's in my fridge" and "what's for dinner," we help users reduce food waste and discover gourmet meals tailored to their dietary goals.

---

## 📸 What it does
![PantryPal Pro App Preview](https://via.placeholder.com/800x450/00e676/ffffff?text=PantryPal+Pro+Interface+Preview)
*The sleek, glassmorphic dashboard featuring smart ingredient scanning and personalized recipe suggestions.*

---

## ✨ Features

### 🥗 Recipe Intelligence
*   **150 Authentic Indian Recipes**: A curated library featuring detailed steps, ingredients, calories, and cook times.
*   **Smart Filtering**: Sort recipes by Tier (Free/Plus/Pro), Meal type (Breakfast, Lunch, Dinner), Cuisine, and Difficulty.
*   **Dietary Precision**: One-tap filters for **Veg Only**, **Vegan**, **High Protein**, **Keto**, **Low Calorie**, and **Quick Meals**.

### 🔍 Smart Pantry (AI-Simulated)
*   **AI Fridge Scanner**: A beautiful drag-and-drop interface to upload fridge photos and "detect" ingredients instantly.
*   **Ingredient-Based Search**: Enter what you have; we'll tell you what you can make.
*   **Allergy Guard**: (Plus/Pro) Gated safety filter to hide recipes containing specific allergens.

### 💎 Premium Experience
*   **Freemium Model**: 3 distinct tiers (Free, Plus, Pro) with feature-gated modals and professional upgrade flows.
*   **Theme Switcher**: 8 stunning themes including **Night**, **Glassomorphism**, **Neon**, **Golden Black**, **Aqua**, **Space**, and **Lava**.
*   **Personalization**: Real-time user greeting, daily food quotes, and a persistent "Favourites" system.
*   **Notifications**: Smooth, context-aware toast notifications for every user action.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Core** | Vanilla HTML5, CSS3 (Flex/Grid), JavaScript (ES6+) |
| **Backend / Database** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **Styling Framework** | Bootstrap 5 (Responsive Utilities) |
| **Typography** | Inter (Google Fonts) |
| **Architecture** | Multi-Page Application (MPA) with Modular Logic |

---

## 📂 Project Structure

<details>
<summary>View Folder Hierarchy</summary>

```text
pantrypal-pro/
├── index.html                  # Splash screen & entry redirect
├── src/
│   ├── html/
│   │   ├── landing.html        # Public-facing home page
│   │   ├── auth.html           # Login/Signup (Supabase integrated)
│   │   ├── dashboard.html      # Main app interface (gated)
│   │   ├── about.html          # Mission & Story
│   │   ├── career.html         # Job openings
│   │   ├── contact.html        # Support & Inquiry form
│   │   ├── privacy.html        # Legal / Privacy policy
│   │   └── terms.html          # Legal / Terms of service
│   ├── css/
│   │   ├── style.css           # Core design system & themes
│   │   ├── landing.css         # Hero & Landing-specific styles
│   │   └── payment.css         # Premium checkout UI styles
│   ├── js/
│   │   ├── app.js              # Global interaction handlers
│   │   ├── data.js             # Mock data & Recipe library
│   │   ├── supabase.config.js  # API Keys (Gitignored)
│   │   ├── services/
│   │   │   ├── supabaseClient.js # DB connection logic
│   │   │   └── authService.js    # Auth wrapper methods
│   │   └── utils/
│   │       ├── logger.js       # Global error logging
│   │       └── validators.js   # Form & Input validation
│   ├── assets/                 # Images, Team photos, Branding
│   └── database/
│       └── schema.sql          # PostgreSQL table structures
```
</details>

---

## 🚀 Local Setup

<details>
<summary>Step-by-Step Installation</summary>

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/pantrypal-pro.git
    cd pantrypal-pro
    ```

2.  **Configure Supabase**
    *   Sign up at [supabase.com](https://supabase.com/).
    *   Create a new project.
    *   Copy your **Project URL** and **Anon Key**.

3.  **Setup Local Environment**
    *   Navigate to `src/js/`.
    *   Create a new file named `supabase.config.js`.
    *   Paste the following (replacing with your keys):
    ```javascript
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = 'your-anon-public-key';
    ```

4.  **Database Migration**
    *   In the Supabase Dashboard, go to the **SQL Editor**.
    *   Paste and run the contents of `database/schema.sql`.

5.  **Run the Project**
    *   Open `index.html` in your browser (use a Live Server extension for the best experience).
</details>

> [!WARNING]
> **Security Warning**: Never commit `src/js/supabase.config.js` to a public repository. It is included in `.gitignore` by default.

---

## 🔑 Supabase Database Setup

To make the app functional, run the following SQL in your Supabase SQL Editor:

```sql
-- Create Recipes Table (Optional if using local data.js)
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  steps JSONB,
  tier TEXT DEFAULT 'free',
  image TEXT,
  rating DECIMAL
);

-- Note: Ensure "Enable Email Auth" is checked in your Supabase Auth settings.
```

---

## 💳 Plan Comparison

| Feature | Free 🥉 | Plus 🥈 | Pro 🥇 |
| :--- | :---: | :---: | :---: |
| Recipe Browsing | ✅ | ✅ | ✅ |
| Smart Search | ✅ | ✅ | ✅ |
| Favourites System | ✅ | ✅ | ✅ |
| Fridge Scans | ❌ | 5 / Day | 10 / Day |
| Allergy Filters | ❌ | ✅ | ✅ |
| Community Comments | ❌ | ✅ | ✅ |
| Video Tutorials | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| **Pricing** | **FREE** | **₹199/mo** | **₹499/mo** |

---

## 🚧 Roadmap

- [x] **Phase 1**: Complete UI/UX with Multi-page architecture. ✅
- [x] **Phase 2**: Supabase Auth & PostgreSQL Integration. ✅
- [x] **Phase 3**: Responsive Design & 8-Theme Switcher. ✅
- [🔄] **Phase 4**: Real AI Image Processing (Computer Vision API).
- [🔄] **Phase 5**: Razorpay Payment Gateway integration.
- [📋] **Phase 6**: AI Chef Chatbot (GPT-4o Integration).

---

## ⚠️ Known Limitations

We believe in transparency. As this is currently a student/hackathon project, please note:
*   **Fridge Scan**: The image upload is functional, but the "detected" ingredients are currently simulated from a mock list. Real Computer Vision API integration is coming in Phase 4.
*   **AI Chatbot**: The UI is fully built, but it currently serves as a feature placeholder.
*   **Payments**: The checkout flow is a UI/UX demonstration. Actual credit card processing is not yet live.
*   **Plan Gating**: Currently relies on client-side state; server-side validation for premium features is in the backlog.

---

## 📸 Screenshots

#### **1. The Landing Page**
![Landing Page](https://via.placeholder.com/600x300?text=Landing+Page+Screenshot)

#### **2. The Kitchen Dashboard**
![Dashboard](https://via.placeholder.com/600x300?text=Dashboard+Screenshot)

#### **3. Recipe Detail Modal**
![Recipe Modal](https://via.placeholder.com/600x300?text=Recipe+Modal+Screenshot)

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <b>Harshit + Team</b> in Pune, India
</p>
