// Mock Recipe Data for PantryPal Pro
const RECIPES = [
  {
    id: 1,
    name: "Quinoa Veggie Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    time: "25 min",
    calories: "320 kcal",
    rating: 4.8,
    tags: ["veg", "high-protein", "gluten-free"],
    ingredients: ["Quinoa", "Broccoli", "Bell Pepper", "Olive Oil", "Chickpeas"],
    premium: false,
    description: "A nutritious bowl packed with protein-rich quinoa and fresh vegetables."
  },
  {
    id: 2,
    name: "Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    time: "20 min",
    calories: "410 kcal",
    rating: 4.6,
    tags: ["high-protein", "keto", "low-carb"],
    ingredients: ["Chicken Breast", "Lettuce", "Tomato", "Olive Oil", "Lemon"],
    premium: false,
    description: "Perfectly grilled chicken on a bed of fresh greens with zesty dressing."
  },
  {
    id: 3,
    name: "Vegan Buddha Bowl",
    image: "https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=300&fit=crop",
    time: "30 min",
    calories: "380 kcal",
    rating: 4.7,
    tags: ["vegan", "veg", "gluten-free"],
    ingredients: ["Sweet Potato", "Avocado", "Chickpeas", "Quinoa", "Tahini"],
    premium: false,
    description: "A colorful plant-based bowl with roasted sweet potato and creamy tahini."
  },
  {
    id: 4,
    name: "Keto Avocado Eggs",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
    time: "15 min",
    calories: "290 kcal",
    rating: 4.9,
    tags: ["keto", "high-protein", "low-carb"],
    ingredients: ["Avocado", "Eggs", "Cheese", "Bacon", "Chives"],
    premium: true,
    description: "Baked eggs nestled in creamy avocado halves — keto perfection."
  },
  {
    id: 5,
    name: "Mediterranean Pasta",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop",
    time: "35 min",
    calories: "520 kcal",
    rating: 4.5,
    tags: ["veg"],
    ingredients: ["Pasta", "Tomato", "Olives", "Feta Cheese", "Basil"],
    premium: true,
    description: "Sun-kissed Mediterranean flavors in a comforting pasta dish."
  },
  {
    id: 6,
    name: "Protein Power Smoothie",
    image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=300&fit=crop",
    time: "5 min",
    calories: "250 kcal",
    rating: 4.4,
    tags: ["veg", "high-protein", "vegan"],
    ingredients: ["Banana", "Peanut Butter", "Oat Milk", "Protein Powder", "Berries"],
    premium: false,
    description: "A thick, creamy smoothie loaded with plant-based protein."
  },
  {
    id: 7,
    name: "Thai Green Curry",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    time: "40 min",
    calories: "450 kcal",
    rating: 4.8,
    tags: ["vegan", "veg", "gluten-free"],
    ingredients: ["Coconut Milk", "Tofu", "Green Beans", "Thai Basil", "Rice"],
    premium: true,
    description: "Aromatic Thai curry with silky tofu and fresh vegetables."
  },
  {
    id: 8,
    name: "Steak & Veggies",
    image: "https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=400&h=300&fit=crop",
    time: "30 min",
    calories: "580 kcal",
    rating: 4.9,
    tags: ["high-protein", "keto", "low-carb"],
    ingredients: ["Beef Steak", "Asparagus", "Garlic", "Butter", "Rosemary"],
    premium: true,
    description: "Juicy seared steak with perfectly roasted seasonal vegetables."
  }
];

const MOCK_INGREDIENTS = [
  "Broccoli", "Chicken Breast", "Bell Pepper", "Quinoa",
  "Olive Oil", "Tomato", "Onion", "Garlic"
];

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    recipes: "Unlimited",
    features: ["Access to established recipe catalog", "Sort by popular, easy, cheap", "No fridge scans"]
  },
  plus: {
    name: "Plus",
    price: "$4.99/mo",
    recipes: "Unlimited",
    features: ["5 daily fridge scans", "Premium badge icon in comments", "Higher priority queue"]
  },
  pro: {
    name: "Pro",
    price: "$9.99/mo",
    recipes: "Unlimited",
    features: ["10 daily fridge scans + 25 monthly quota", "Daily left quota roll over", "Dedicated 24/7 support", "First priority in queue"]
  }
};

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Home Cook", text: "PantryPal Pro changed how I cook! No more wasted groceries.", avatar: "S", rating: 5 },
  { name: "James K.", role: "Student", text: "As a college student, this app saves me money and time every week.", avatar: "J", rating: 5 },
  { name: "Priya R.", role: "Fitness Enthusiast", text: "The dietary filters are perfect for my high-protein meal prep.", avatar: "P", rating: 4 },
  { name: "Mike T.", role: "Parent", text: "My kids love the recipes. It's made family meals so much easier!", avatar: "M", rating: 5 }
];
