# Lecture Notes - AI Agent Instructions

## Project Overview

A Next.js 16 application for lecture notes, using React 19 with the React Compiler enabled.

## Tech Stack

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Runtime**: Bun (use `bun` commands, not `npm`)
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css`)
- **UI Components**: shadcn/ui (install components via `bunx shadcn@latest add <component>`)
- **Language**: TypeScript with strict mode

## Project Structure

```
src/
├── app/           # Next.js App Router pages and layouts
│   ├── layout.tsx # Root layout - add global providers here
│   ├── page.tsx   # Home page
│   └── globals.css
└── components/    # Reusable React components
```

## Key Conventions

### Path Aliases

Use `@/*` imports for the `src/` directory:

```typescript
import { Component } from "@/components/component";
```

### Component Patterns

- Use shadcn/ui components as the primary UI library
- Style with Tailwind CSS utility classes
- React Compiler is enabled - avoid manual memoization (no `useMemo`/`useCallback` needed)

### Development Commands

```bash
bun dev      # Start development server
bun build    # Production build
bun lint     # Run ESLint
```

## Important Notes

- This is an early-stage project - the `pdf-viewer.ts` component is currently empty/placeholder
- When adding new UI components, use `bunx shadcn@latest add <component>` to maintain consistency
