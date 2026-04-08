# Style & Configuration Guide — Frontend

## 1. Unified Syle & Patterns
This file acts as the single source of truth for the project's visual identity and development patterns.

### Color Palette (Design Tokens)
- **Primary**: Brand color for actions and highlights.
- **Secondary**: Supporting color for navigation or side elements.
- **Background**: Light/Dark modes (Next-Themes).
- **Text**: Contrast-safe levels.

### Formats & Spacing
- **Typography**: Inter (primary), Sans-serif (fallback).
- **Spacing**: Base 4px system (Tailwind classes only: `p-1` to `p-16`).
- **Date/Time**: DD/MM/YYYY (Standard format).
- **Currency**: VND / KNOW-U / KNOW-G.

## 2. Shared Components Lifecycle
Before creating a new feature, scan `src/components/ui/` for existing Radix-based components.
- **Reuse first**: If a component exists, wrap or extend it.
- **Dependency Scan**: Map out which pages use the same component to avoid regression.

## 3. Configuration & Global State
- **State Management**: React Context (Auth, Theme, Map context).
- **API Fetching**: All calls must reside in `src/services/` (credentials: `include`).
- **CSRF**: Header `x-csrf-token` is mandatory for **POST**, **PUT**, and **DELETE**.

## 4. Map & GIS Standards
- **Source**: Mapbox GL JS.
- **SSR**: Never render Map/3D components on the server. Always use `dynamic(() => import(...), { ssr: false })`.
