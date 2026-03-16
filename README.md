# 🎳 Strajk Bowling

A modern bowling booking application built with **React**, **TypeScript**, and **Vite**. This project demonstrates a robust implementation of automated testing and CI/CD pipelines.

## 🚀 Features
- **Dynamic Booking:** Select date, time, and number of lanes.
- **Player Management:** Add/remove players with individual shoe size validation.
- **Real-time Feedback:** Comprehensive error handling for incomplete or invalid bookings.
- **Confirmation Flow:** Seamless transition to booking summary with persistent storage.

## 🧪 Testing Infrastructure
The core of this project is its reliability. We use a professional-grade testing stack to ensure everything works as expected:

- **Vitest**: A high-performance test runner.
- **React Testing Library**: For testing components through user interactions.
- **Mock Service Worker (MSW)**: To intercept and mock API network requests, ensuring tests run independently of backend availability.

### How to Run Tests
```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run
🤖 CI/CD (GitHub Actions)
This repository is configured with an automated GitHub Actions workflow.

Every time code is pushed to the main or master branch, the CI pipeline installs dependencies and executes the full Vitest suite to prevent regression bugs.

🛠️ Technical Setup (Vite Template)
This project was bootstrapped with the Vite react-ts template. It provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Expanding the ESLint configuration
If you are developing a production application, it is recommended to update the configuration to enable type-aware lint rules in eslint.config.js.
