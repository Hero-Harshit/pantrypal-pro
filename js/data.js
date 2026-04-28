// Mock Recipe Data for PantryPal Pro
const RECIPES = [];

const MOCK_INGREDIENTS = [
  "Broccoli", "Chicken Breast", "Bell Pepper", "Quinoa",
  "Olive Oil", "Tomato", "Onion", "Garlic"
];

const PLANS = {
  free: {
    name: "PantryPal Free",
    price: "₹0/mo",
    recipes: "Limited",
    features: ["Access to established recipe catalog", "Sort by popular, easy, cheap", "No fridge scans"]
  },
  plus: {
    name: "PantryPal Plus",
    price: "₹199/mo",
    recipes: "Most",
    features: ["5 daily fridge scans", "Access to Community Comments", "Higher priority queue", "24/7 chat support"]
  },
  pro: {
    name: "PantryPal Pro",
    price: "₹499/mo",
    recipes: "All",
    features: ["10 daily fridge scans", "Exclusive Video Tutorials", "Dedicated 24/7 call support", "First priority in queue"]
  }
};

const TESTIMONIALS = [
  { name: "Bhargav G.", role: "Home Cook", text: "PantryPal Pro changed how I cook! No more wasted groceries.", avatar: "S", rating: 5 },
  { name: "Yash Y.", role: "Student", text: "As a college student, this app saves me money and time every week.", avatar: "J", rating: 5 },
  { name: "Swamini P.", role: "Fitness Enthusiast", text: "The dietary filters are perfect for my high-protein meal prep.", avatar: "P", rating: 4 },
  { name: "Anshul K.", role: "Parent", text: "My kids love the recipes. It's made family meals so much easier!", avatar: "M", rating: 5 }
];
