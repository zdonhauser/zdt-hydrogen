# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

This is a Shopify Hydrogen headless commerce application built with:
- **Hydrogen** - Shopify's React-based framework for headless commerce
- **React Router 7** - Full-stack web framework (successor to Remix)
- **TypeScript** - Type safety throughout the codebase
- **Tailwind CSS 4** - Utility-first CSS framework with custom styling
- **Vite** - Build tool and development server
- **Oxygen** - Shopify's edge runtime for deployment
- **GraphQL** - API queries via Shopify Storefront API

## Development Commands

### Core Development
- `npm run dev` - Start development server with codegen
- `npm run build` - Build for production with codegen
- `npm run preview` - Preview production build locally
- `npm run codegen` - Generate GraphQL types and queries

### Code Quality
- `npm run lint` - Run ESLint on codebase
- `npm run typecheck` - Run TypeScript type checking

## Architecture Overview

### Application Structure
- `app/` - Main application code following React Router conventions
  - `routes/` - File-based routing system
  - `components/` - Reusable UI components
  - `lib/` - Utilities, context, GraphQL fragments, and configuration
  - `styles/` - CSS files (Tailwind, app styles, reset)
- `server.ts` - Oxygen worker entry point
- `react-router.config.ts` - Router configuration

### Key Architectural Patterns

#### Data Loading Strategy
The app uses a sophisticated data loading pattern in `root.tsx`:
- **Critical data** - Loaded synchronously for above-the-fold content (header)
- **Deferred data** - Loaded asynchronously for below-the-fold content (footer, cart, auth state)
- Performance optimization with selective revalidation via `shouldRevalidate`

#### GraphQL Integration
- GraphQL fragments defined in `app/lib/fragments.ts`
- Auto-generated types in `storefrontapi.generated.d.ts`
- Shopify Storefront API integration with caching strategies

#### Context & Session Management
- Hydrogen context creation in `app/lib/context.ts`
- Custom session handling with `AppSession`
- Environment-based configuration (SESSION_SECRET required)

#### Routing Architecture
- File-based routing via `@react-router/fs-routes`
- Hydrogen-specific route enhancements
- Layout wrapper in `layout.tsx` with PageLayout component

### Business Domain Features
This appears to be an adventure park/jungle gym business with:
- **Party booking system** - Custom party forms with date/time selection
- **E-commerce integration** - Product catalog, cart, checkout flow
- **Customer accounts** - Authentication and order management
- **Content management** - Pages, blogs, policies via Shopify CMS

### Component Patterns
- Components use TypeScript with proper Shopify/Hydrogen type imports
- GraphQL fragments typed with generated types (e.g., `ProductFragment`)
- Form components use controlled state patterns
- Responsive design with Tailwind utility classes

### Environment & Deployment
- Deploys to Shopify Oxygen (edge runtime)
- Environment variables managed through Shopify CLI
- Customer Account API integration requires public domain setup
- Node.js 18+ required for development

## Important Notes

### GraphQL Code Generation
Always run `npm run codegen` after modifying GraphQL queries to regenerate types.

### Visual Design System

This application follows a **bold, energetic, and playful aesthetic** designed to capture the excitement of a family amusement park experience. The design system emphasizes:

#### Core Design Principles
- **Maximum Impact**: Large, bold typography that commands attention
- **Dynamic Movement**: Continuous animations and scroll-triggered effects throughout the user journey  
- **Vibrant Energy**: High-contrast colors and dynamic visual elements
- **Family-Friendly Fun**: Approachable design that appeals to all ages
- **Interactive Engagement**: Touch and hover states with satisfying feedback

#### Color Palette
The app uses a bright, high-energy color system built around theme park excitement:

**Primary Colors:**
- `--color-brand-yellow: #fff200` - Electric yellow (primary brand color)
- `--color-brand-blue: #00cfff` - Bright cyan blue  
- `--color-brand-red: #ed1c24` - Bold red
- `--color-brand-green: #8bc34a` - Vibrant green
- `--color-brand-pink: #ff6ec7` - Hot pink

**Supporting Colors:**
- `--color-dark: #000` - Pure black for text and borders
- `--color-light: #fff` - Pure white for backgrounds
- `--color-brand-cream: #fffcf0` - Warm cream for softer backgrounds

Each color includes hover variants (e.g., `--color-brand-yellow-hover`) for interactive feedback.

#### Typography Approach
- **Headlines**: Extra-bold, uppercase, tracking-wide treatments
- **Font Weight**: Heavy emphasis on `font-extrabold` (800-900 weights)
- **Case**: Strategic use of `text-transform: uppercase` for impact
- **Sizing**: Large scale hierarchy with responsive sizing (text-4xl, text-5xl+)
- **Font Family**: Inter system font for clean readability

#### Animation & Movement Strategy
- **Continuous Motion**: Horizontal scrolling ribbons with configurable speeds
- **Scroll-Triggered Effects**: Video playback and content reveals based on scroll position
- **Hover Animations**: Scale transforms, color transitions, and shadow effects
- **Interactive Feedback**: Pause/play states on touch/mouse interactions
- **Smooth Transitions**: CSS transitions for all interactive states

#### Layout Patterns
- **Full-Width Sections**: Edge-to-edge layouts with centered content containers
- **Bold Borders**: Heavy black borders (4px+) around key elements
- **Card-Based Design**: Rounded corners with drop shadows for content blocks
- **Responsive Grid**: Flexible grid systems that adapt across device sizes
- **Sticky Elements**: Strategic use of position sticky for navigation and key content

#### Component Style Guidelines
- **Buttons**: Large, rounded, with bold borders and hover scale effects
- **Forms**: High-contrast inputs with clear visual hierarchy
- **Cards**: White backgrounds with black borders and shadow depth
- **Navigation**: Sticky headers with bold typography and clear section divisions
- **Interactive Elements**: Clear hover/focus states with color and scale feedback

#### Accessibility & Usability
- **High Contrast**: Pure black text on white/colored backgrounds
- **Large Touch Targets**: Generous button and link sizes for mobile
- **Clear Visual Hierarchy**: Strong contrast between headings and body text
- **Motion Preferences**: Respect user motion preferences for animations

When creating new components or modifying existing ones:
1. Use the established color variables from `app.css`
2. Implement bold, high-contrast styling with thick borders
3. Add appropriate hover/focus states with transitions
4. Consider adding subtle animations or movement where appropriate
5. Maintain the playful, energetic aesthetic throughout
6. **NO EMOJIS** - Avoid using emojis in the design unless explicitly requested by the user

### Performance Considerations
- Root loader implements aggressive caching and selective revalidation
- Critical vs deferred data patterns should be maintained
- Storefront API queries use appropriate cache policies (CacheLong, etc.)