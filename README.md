# MealGro Web

A modern meal planning web application built with [Vike](https://vike.dev) and [Vue 3](https://vuejs.org).

## Tech Stack

- **Framework**: Vike (Vue.js SSR framework)
- **UI**: Vue 3 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

```sh
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Project Structure

- `pages/` - File-based routing with Vike conventions
  - `index/` - Homepage
  - `_error/` - Error page (404/500)
  - `+Layout.vue` - App layout wrapper
  - `+Head.vue` - Global head tags
  - `+config.ts` - Global configuration

## Features

- Server-Side Rendering (SSR) enabled
- File-based routing
- Page transition animations
- Tailwind CSS styling
- TypeScript supports

