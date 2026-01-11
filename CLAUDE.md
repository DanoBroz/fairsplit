# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FairSplit is a Progressive Web App (PWA) for couples to track and split expenses fairly based on income proportions. Built with Next.js 16 and React 19, the app calculates household expense splits proportional to each partner's income, ensuring equitable contribution rather than equal splitting.

## Development Commands

```bash
# Install dependencies
yarn install

# Development server (runs on http://localhost:3000)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Linting
yarn lint

# Testing
yarn test                # Run all tests
yarn test:ui             # Run tests with UI
yarn test:coverage       # Run tests with coverage
vitest run path/to/test  # Run a single test file
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.3
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks with localStorage persistence
- **Testing**: Vitest with React Testing Library and jsdom
- **TypeScript**: Strict mode enabled
- **Icons**: lucide-react
- **Utilities**:
  - `clsx` and `tailwind-merge` for className utilities (via `cn()` helper)
  - `date-fns` for date formatting

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components
  - `ui/` - Reusable UI primitives (Button, Input, Card, Modal, etc.)
  - `IncomeSetup.tsx` - Income and names configuration
  - `SummaryCards.tsx` - Expense summaries and settlement calculation
  - `ExpenseList.tsx` - Expense list with filtering
  - `AddExpenseModal.tsx` - Modal for adding new expenses
- `src/lib/` - Utility functions and hooks
  - `utils.ts` - Helper functions like `cn()` for className merging
  - `useExpenseStore.ts` - Main state management hook
- `src/types/` - TypeScript type definitions
- `__tests__/` - Vitest test files
- `public/` - Static assets including PWA manifest and icons

## Key Architecture Patterns

### Income-Based Proportional Splitting
The core feature calculates what each person should contribute based on income ratios:
- Users enter their monthly incomes (e.g., $3,000 and $2,000)
- App calculates each person's proportion of total household income (60% / 40%)
- Total household expenses are displayed
- Each person's fair share is calculated proportionally (not equally)
- Shows: "You should pay $X (60%), Partner should pay $Y (40%)"
- Private expenses are added to each person's total
- No settlement tracking - just shows what each person owes in total

### Expense Categories
- **Household expenses**: Split proportionally between partners based on income
- **Private expenses**: Not split, tracked individually
- **Toggle feature**: Private expenses can be included in household pool if needed

### State Management
The app uses a custom hook (`useExpenseStore`) that:
- Persists all data to localStorage
- Calculates proportions, totals, and settlements in real-time
- Provides CRUD operations for expenses
- Manages income, names, and currency settings

### Type Definitions
Core types are defined in `src/types/index.ts`:
- `Expense`: Individual expense records with type (household/private), amount, payer, category
- `Income`: Monthly income for both partners
- `AppState`: Complete application state
- `CURRENCIES`: Supported currencies (CZK, EUR, USD, GBP, PLN)
- `CATEGORIES`: Predefined expense categories

### Path Aliases
The project uses `@/*` as an alias for `./src/*` in both TypeScript and Vitest configurations.

### PWA Configuration
The app is configured as a PWA with:
- Manifest at `/public/manifest.json`
- Required icons: `icon-192.png` and `icon-512.png` in `/public`
- Apple Web App metadata configured in `src/app/layout.tsx`

## Testing Setup

Vitest is configured with:
- jsdom environment for DOM testing
- React Testing Library for component testing
- Jest-DOM matchers via `@testing-library/jest-dom`
- Setup file: `vitest.setup.ts`
- Global test utilities enabled

## Styling Approach

The project uses Tailwind CSS v4 with a utility-first approach. The `cn()` helper in `src/lib/utils.ts` combines `clsx` and `tailwind-merge` for conditional and merged class names.

## Development Notes

- The project uses the App Router (page.tsx is a client component due to state management)
- Strict TypeScript mode is enabled
- ESLint is configured with Next.js recommended rules
- The app supports both light and dark modes via Tailwind's dark mode utilities
- vitest.config.ts is excluded from Next.js build to avoid vite version conflicts
- All state is currently persisted to localStorage (Supabase integration planned for future)
