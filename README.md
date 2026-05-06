# SecurePay Gateway UI

A premium, highly-accessible Payment Gateway interface built with Next.js 14, TypeScript, and Redux Toolkit. This project simulates a full payment lifecycle including real-time validation, live card previews, mock gateway responses, and persistent transaction history.

## Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Architecture Decisions

- **Redux Toolkit (RTK)**: Chosen over smaller libraries like Zustand to leverage its highly structured slice pattern. RTK is ideal for managing complex, related state transitions (e.g., `PaymentStatus`, `attemptCount`, and `transactionId`) where maintaining strict predictability and developer tooling (Redux DevTools) is critical for financial interfaces.
- **`usePayment` Hook**: We encapsulate side effects (fetch calls, `AbortController` timeouts, and Redux dispatches) into a single custom hook. This keeps our UI components purely presentational and simplifies testing of the business logic.
- **Centralized Types**: All domain models and state interfaces are defined in `src/types/index.ts`, ensuring a single source of truth and preventing "any" type leaks across the codebase.
- **Vanilla CSS & Tailwind**: Used for rapid development of a premium "glassmorphism" aesthetic without the overhead of heavy component libraries, ensuring maximum performance and customizability.

## Assumptions & Handled Cases

- **Luhn Validation**: Card number validation includes a client-side Luhn algorithm check to catch typos before hitting the API.
- **Local Persistence**: Transaction history is persisted in `localStorage` (`pg_transactions`) so users don't lose their data on page refresh.
- **Gateway Simulation**: The API route simulates real-world conditions including success (~60%), failure (~25%), and network timeouts (~15%). The backend timeout simulates 8 seconds of delay while the frontend safely aborts after 6 seconds.
- **Accessibility & Focus Management**: Input error messages are linked to their respective inputs using `aria-describedby` and `aria-invalid` for screen readers. Focus is programmatically managed to move between the form and status screens, ensuring a seamless experience.

## What I would improve with more time

- **Real Tokenization**: Integrate with a real PCI-compliant vault (like Stripe or PCI Proxy) to handle sensitive card data.
- **Comprehensive Testing**:
  - **Unit Tests**: Jest tests for `cardUtils` and validation logic.
  - **Component Tests**: React Testing Library for verifying accessible label associations and error messages.
  - **E2E Tests**: Playwright scripts to simulate the full retry-on-failure lifecycle.
- **Internationalization (i18n)**: Support for multiple languages and dynamic currency formatting based on the user's locale.
- **Persistent AbortController**: Better cleanup patterns for long-running fetch requests during component unmounts.
