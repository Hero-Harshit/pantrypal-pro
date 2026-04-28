// ============================================================
// PantryPal Pro — Local Data (Fallback + Mock Data)
// /js/data.js
//
// Used when Supabase is not configured or for offline fallback.
// When Supabase IS configured, RecipeService fetches from DB.
// ============================================================

// Mock ingredients returned by AI scan simulation
const MOCK_INGREDIENTS = [
  "Broccoli", "Chicken Breast", "Bell Pepper", "Quinoa",
  "Olive Oil", "Tomato", "Onion", "Garlic"
];

// Subscription plans (pricing)
const PLANS = {
  free: {
    name: "PantryPal Free",
    price: "₹0/mo",
    recipes: "Limited",
    features: [
      "Access to established recipe catalog",
      "Sort by popular, easy, cheap",
      "No fridge scans"
    ]
  },
  plus: {
    name: "PantryPal Plus",
    price: "₹199/mo",
    recipes: "Most",
    features: [
      "5 daily fridge scans",
      "Access to Community Comments",
      "Higher priority queue",
      "24/7 chat support"
    ]
  },
  pro: {
    name: "PantryPal Pro",
    price: "₹499/mo",
    recipes: "All",
    features: [
      "10 daily fridge scans",
      "Exclusive Video Tutorials",
      "Dedicated 24/7 call support",
      "First priority in queue"
    ]
  }
};

// User testimonials
const TESTIMONIALS = [
  { name: "Bhargav G.", role: "Home Cook", text: "PantryPal Pro changed how I cook! No more wasted groceries.", avatar: "B", rating: 5 },
  { name: "Yash Y.", role: "Student", text: "As a college student, this app saves me money and time every week.", avatar: "Y", rating: 5 },
  { name: "Swamini P.", role: "Fitness Enthusiast", text: "The dietary filters are perfect for my high-protein meal prep.", avatar: "S", rating: 4 },
  { name: "Anshul K.", role: "Parent", text: "My kids love the recipes. It's made family meals so much easier!", avatar: "A", rating: 5 }
];

// Local recipe fallback — used when Supabase is not configured
// These mirror the seed data in schema.sql
const RECIPES = [
  {
    id: 1,
    name: "Dal Makhani",
    description: "A classic creamy Indian lentil dish with butter and spices.",
    ingredients: ["Black lentils (1 cup)", "Kidney beans (1/4 cup)", "Butter (3 tbsp)", "Cream (2 tbsp)", "Tomatoes (2)", "Onion (1)", "Ginger-garlic paste (1 tbsp)", "Cumin seeds", "Garam masala", "Salt to taste"],
    steps: ["Soak lentils overnight. Pressure cook until soft.", "Sauté cumin in butter, add onions until golden.", "Add ginger-garlic paste and tomatoes, cook 5 min.", "Add cooked lentils, spices, and simmer 20 min.", "Stir in cream, garnish with butter and coriander."],
    tags: ["veg", "high-protein"],
    tier: "free",
    meal: "dinner",
    image: "../assets/landing page image 1.jpg",
    calories: 420,
    time: "45 min",
    rating: 4.8
  },
  {
    id: 2,
    name: "Quinoa Veggie Bowl",
    description: "A nutritious bowl loaded with roasted veggies and protein-rich quinoa.",
    ingredients: ["Quinoa (1 cup)", "Broccoli (1 cup)", "Bell peppers (2)", "Olive oil (2 tbsp)", "Lemon juice", "Garlic (2 cloves)", "Salt & pepper"],
    steps: ["Cook quinoa per package instructions.", "Roast veggies at 200°C for 20 min.", "Mix lemon juice, garlic, and olive oil for dressing.", "Assemble bowl and drizzle dressing."],
    tags: ["vegan", "gluten-free", "high-protein"],
    tier: "plus",
    meal: "lunch",
    image: "../assets/landing page image 2.jpg",
    calories: 310,
    time: "30 min",
    rating: 4.6
  },
  {
    id: 3,
    name: "Paneer Tikka",
    description: "Marinated paneer grilled to perfection — a crowd favorite.",
    ingredients: ["Paneer (250g)", "Yogurt (1/2 cup)", "Red chili powder (1 tsp)", "Cumin (1 tsp)", "Garam masala (1/2 tsp)", "Lemon juice", "Capsicum & onion"],
    steps: ["Cube paneer and marinate with yogurt and spices for 1 hr.", "Skewer paneer with veggies.", "Grill or bake at 220°C for 15-20 min.", "Serve with mint chutney."],
    tags: ["veg", "keto", "high-protein"],
    tier: "pro",
    meal: "dinner",
    image: "../assets/landing page image 3.jpg",
    calories: 350,
    time: "35 min",
    rating: 4.9
  },
  {
    id: 4,
    name: "Masala Oats",
    description: "A quick savory oats breakfast that keeps you full and energized.",
    ingredients: ["Rolled oats (1 cup)", "Onion (1/2)", "Tomato (1)", "Green peas (1/4 cup)", "Mustard seeds (1/2 tsp)", "Turmeric (1/4 tsp)", "Green chili (1)", "Coriander leaves", "Salt to taste"],
    steps: ["Dry roast oats for 2 min.", "Temper mustard seeds in oil and sauté vegetables.", "Add oats and 1.5 cups water, cook 5 min.", "Garnish with coriander and serve hot."],
    tags: ["veg", "vegan", "gluten-free", "low-carb"],
    tier: "free",
    meal: "breakfast",
    image: "../assets/landing page image 1.jpg",
    calories: 220,
    time: "15 min",
    rating: 4.3
  },
  {
    id: 5,
    name: "Chicken Tikka Masala",
    description: "Tender chicken in a rich, spiced tomato cream sauce.",
    ingredients: ["Chicken breast (500g)", "Yogurt (1/2 cup)", "Tomatoes (3)", "Onion (1)", "Cream (3 tbsp)", "Tikka masala spice mix", "Garlic-ginger paste (2 tbsp)"],
    steps: ["Marinate chicken in yogurt and spices for 2 hrs.", "Grill chicken until charred.", "Make sauce with onions, tomatoes, and spices.", "Add chicken to sauce and simmer. Finish with cream."],
    tags: ["high-protein", "keto"],
    tier: "plus",
    meal: "dinner",
    image: "../assets/landing page image 2.jpg",
    calories: 480,
    time: "50 min",
    rating: 4.9
  },
  {
    id: 6,
    name: "Avocado Toast with Egg",
    description: "A protein-packed breakfast that is quick and satisfying.",
    ingredients: ["Whole grain bread (2 slices)", "Avocado (1)", "Eggs (2)", "Cherry tomatoes (6)", "Chili flakes (pinch)", "Salt & pepper", "Lemon juice (1 tsp)"],
    steps: ["Toast bread until crisp.", "Mash avocado with lemon, salt, and pepper.", "Poach or fry eggs to preference.", "Assemble and top with tomatoes and chili flakes."],
    tags: ["veg", "high-protein", "low-carb"],
    tier: "pro",
    meal: "breakfast",
    image: "../assets/landing page image 3.jpg",
    calories: 390,
    time: "10 min",
    rating: 4.7
  },
  {
    id: 7,
    name: "Chole Bhature",
    description: "Classic North Indian chickpea curry served with fluffy fried bread.",
    ingredients: ["Chickpeas (2 cups, soaked)", "Onions (2)", "Tomatoes (2)", "Chana masala (2 tsp)", "Ghee (2 tbsp)", "Ginger-garlic paste", "Maida (for bhature)", "Yogurt (1/2 cup)"],
    steps: ["Pressure cook chickpeas. Make spicy onion-tomato gravy.", "Add chickpeas, simmer 15 min.", "Knead maida dough with yogurt. Rest 2 hrs.", "Roll into circles and deep fry until puffed. Serve hot."],
    tags: ["veg", "high-protein"],
    tier: "free",
    meal: "lunch",
    image: "../assets/landing page image 1.jpg",
    calories: 560,
    time: "60 min",
    rating: 4.7
  },
  {
    id: 8,
    name: "Keto Egg Bhurji",
    description: "A spicy Indian scrambled eggs dish that is keto-friendly and quick.",
    ingredients: ["Eggs (4)", "Onion (1/2)", "Tomato (1)", "Green chili (1)", "Cumin seeds (1/2 tsp)", "Turmeric (1/4 tsp)", "Butter (1 tbsp)", "Coriander for garnish"],
    steps: ["Beat eggs with salt and spices.", "Sauté onion, tomato, and chili in butter.", "Add eggs and scramble until cooked.", "Garnish with coriander. Serve with bread or alone for keto."],
    tags: ["keto", "high-protein", "low-carb", "veg"],
    tier: "free",
    meal: "breakfast",
    image: "../assets/landing page image 2.jpg",
    calories: 270,
    time: "10 min",
    rating: 4.5
  }
];
