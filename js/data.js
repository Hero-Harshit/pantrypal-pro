// ============================================================
// PantryPal Pro — Local Data (Fallback + Mock Data)
// /js/data.js
//
// Used when Supabase is not configured or for offline fallback.
// When Supabase IS configured, RecipeService fetches from DB.
// ============================================================

// Mock ingredients returned by AI scan simulation
const MOCK_INGREDIENTS = [

];

// Subscription plans (pricing)
const PLANS = {
  free: {
    name: "PantryPal Free",
    price: "₹0/mo",
    recipes: "Limited",
    features: [
      "Access to a wide established recipe catalog",
      "Variety of sorting filters",
      "Basic meal planning",
      "No AI Features"
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
      "24/7 chat support",
      "Dark Theme Unlocked",
      "Everything in Free"
    ]
  },
  pro: {
    name: "PantryPal Pro",
    price: "₹499/mo",
    recipes: "All",
    features: [
      "10 daily fridge scans",
      "Exclusive Video Tutorials",
      "First priority in queue",
      "Dedicated 24/7 call support",
      "Glassomorphic Theme Unlocked",
      "Everything in PLUS"
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

// Local recipe fallback — empty for now as requested
const RECIPES = [];
