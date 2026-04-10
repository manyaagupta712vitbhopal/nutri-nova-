# NutriNova - Smart Dietary Assistant

NutriNova is a comprehensive, gamified web application built to promote healthier eating habits. Featuring a premium, glassmorphism-inspired design, the app acts as a smart dietary assistant by offering personalized nutritional insights, context-aware health alerts, ingredient tracking, and mood analytics.

## ✨ Features

- **Personalized Onboarding:** Tailored user profiles capturing age, goals, and critical medical history (with specialized support for conditions like PCOS/PCOD and Diabetes).
- **Gamified Nutrition Dashboard:** Track your daily calories alongside engaging elements like eating streaks, cheat meal milestones, and unlockable badges that reward consistency.
- **Smart Meal Logging:** Easily log meals through a simulated AI photo recognition pipeline or quick database search.
- **Dynamic Medical Alerts:** Context-sensitive warnings based on user medical records. For example, insulin spike alerts for refined carbs if the user has PCOS, or glycemic index warnings for Diabetes.
- **Mood Analytics Board:** Analyzes meals and user sentiment over time, showing you which foods leave you energized versus sluggish.
- **Virtual Pantry Tracker:** Add ingredients you have at home (like Paneer or Oats) and receive smart, localized recipe recommendations.
- **Community & Social Interaction:** Engage in virtual group challenges or check your standing against friends on leaderboards to foster motivation.

## 🛠 Tech Stack

Built primarily using vanilla web technologies to ensure a lightweight and blazing-fast experience:
- **HTML5:** Semantic architecture for application structure.
- **CSS3 (Vanilla CSS):** Responsive layouts, smooth micro-animations, glassmorphism effects, and dynamic gradients.
- **JavaScript (Vanilla JS):** Core application state management, local storage, predictive routing, and component orchestration.
- **FontAwesome:** Scalable iconography.
- **Google Fonts (Outfit):** Modern and premium typography.

## 🚀 How to Run Locally

You don't need any complex build tools to run this application!

1. Clone or download this repository to your local machine.
2. Ensure all files (`index.html`, `style.css`, and `app.js`) are in the same folder.
3. Open `index.html` directly in any modern web browser or start a local development server (e.g., using VS Code Live Server, or Python's `http.server`).

*Example using Python:*
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000/`.

## 📁 File Structure

```text
nutri-nova/
├── index.html       # Entry point containing core wrapper
├── style.css        # The complete UI design system and stylesheets
└── app.js           # Single-page application logic and state management
```

## 🧠 State Management

NutriNova relies on memory and `localStorage` to manage its application state across sessions, ensuring that your streaks, logged meals, pantry details, and virtual badges stay intact upon refreshing using basic JSON serialization.

---
*Built with ❤️ to make healthy living highly engaging out of the box.*
