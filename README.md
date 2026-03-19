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
- **Coverage**: Aiming for and achieving high branch coverage to ensure all logic paths are verified.
  
## 📋 Requirement Coverage (User Stories)
The test suite is strictly mapped to the project's requirements, covering both base functionality and advanced validation (VG-level):

- US 1-3 (Booking & Equipment): Tests for date/time selection, player counts, and dynamic shoe size management.

- US 4 (Checkout): Integration tests for the booking submission and price calculation.

- US 5 (Navigation): Comprehensive routing tests, including menu toggles and sessionStorage persistence.

- Edge Cases & Validation: * Verification that number of shoes matches number of players (VG).

    - Validation of mandatory fields and max capacity (4 players per lane) (VG).

    - Graceful handling of corrupt or missing session data (VG).

    - API error handling (500 Internal Server Error) to ensure UI stability.

## 🤖 CI/CD (GitHub Actions)
This repository is configured with an automated GitHub Actions workflow.

Every time code is pushed to the main branch, the CI pipeline:

1. Installs dependencies.

2. Executes the full Vitest suite.

3. Ensures no regression bugs are introduced to the core booking logic.

## 🛠️ Technical Setup
- Vite for lightning-fast HMR and bundling.

- TypeScript for type-safety across components and tests.

- ESLint configured for high code quality.

### How to Run Tests
```bash
# Run tests in watch mode
npm test

# Run tests with coverage report
npm run coverage

# Run tests once (CI mode)
npm test -- --run

