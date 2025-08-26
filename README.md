# ZDT's Amusement Park - Headless Commerce Experience

A modern, high-performance headless commerce application built for ZDT's Amusement Park. This application showcases advanced e-commerce functionality with a bold, energetic design system that captures the excitement of a family amusement park experience.

## 🎢 About This Project

ZDT's Amusement Park is a comprehensive headless commerce solution featuring:

- **Party booking system** - Custom forms with date/time selection and group management
- **E-commerce integration** - Full product catalog, cart, and checkout functionality  
- **Customer accounts** - Authentication, order management, and profile features
- **Content management** - Pages, blogs, and policies managed through Shopify CMS
- **Dynamic animations** - Scroll-triggered effects, continuous motion ribbons, and interactive feedback
- **Responsive design** - Mobile-first approach with bold visual hierarchy

## 🛠 Technology Stack

### Core Framework
- **[Hydrogen](https://shopify.dev/custom-storefronts/hydrogen)** - Shopify's React-based framework for headless commerce
- **[React Router 7](https://reactrouter.com/)** - Full-stack web framework (successor to Remix) in framework mode
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety throughout the codebase
- **[Vite](https://vitejs.dev/)** - Build tool and development server

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework with custom design tokens
- **Custom Design System** - Bold, high-energy aesthetic with vibrant color palette
- **Responsive Components** - Mobile-first responsive design patterns

### Data & API
- **[GraphQL](https://graphql.org/)** - API queries via Shopify Storefront API
- **Auto-generated Types** - TypeScript types generated from GraphQL schema
- **Caching Strategies** - Optimized data loading with selective revalidation

### Deployment & Runtime
- **[Oxygen](https://shopify.dev/docs/custom-storefronts/oxygen)** - Shopify's edge runtime for global deployment
- **GitHub Actions** - Automated CI/CD pipeline
- **Edge-optimized** - Fast global content delivery

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Storybook** - Component development and documentation

## 🚀 Getting Started

### Prerequisites
- Node.js version 18.0.0 or higher
- npm or yarn package manager
- Shopify CLI with Hydrogen plugin (`@shopify/cli-hydrogen`)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd zdt-jungle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Shopify store credentials

# Optional: Install Shopify CLI globally (if not already installed)
npm install -g @shopify/cli @shopify/cli-hydrogen
```

### Development Commands

```bash
# Start development server (recommended)
h2 dev

# Start development server with host binding (for network access)
h2 dev --host

# Build for production
h2 build

# Preview production build locally
h2 preview

# Generate GraphQL types and queries
h2 codegen

# Alternative: Use npm scripts
npm run dev      # equivalent to h2 dev
npm run build    # equivalent to h2 build
npm run codegen  # equivalent to h2 codegen
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run typecheck

# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## 🏗 Architecture Overview

### Application Structure

```
app/
├── components/          # Reusable UI components
│   ├── AnimatedBackground.tsx
│   ├── Carousel.tsx
│   ├── PartyForm.tsx
│   └── ...
├── routes/             # File-based routing system
│   ├── _index.tsx      # Homepage
│   ├── products.$handle.tsx
│   ├── pages.*.tsx     # Static pages
│   └── account.*.tsx   # Customer account pages
├── lib/                # Utilities and configuration
│   ├── context.ts      # Hydrogen context setup
│   ├── fragments.ts    # GraphQL fragments
│   ├── session.ts      # Session management
│   └── security-utils.ts
├── styles/             # CSS and styling
│   ├── app.css         # Custom design tokens
│   ├── tailwind.css    # Tailwind imports
│   └── reset.css       # CSS reset
└── graphql/            # GraphQL operations
    └── customer-account/
```

### Key Features

#### Advanced Data Loading
- **Critical data**: Loaded synchronously for above-the-fold content (header, navigation)
- **Deferred data**: Loaded asynchronously for below-the-fold content (footer, cart)
- **Smart caching**: Selective revalidation to optimize performance

#### Party Booking System
- Custom calendar component with date/time selection
- Group size management and pricing calculations  
- Form validation with spam protection
- Email integration for booking confirmations

#### E-commerce Functionality
- Product catalog with variant selection
- Shopping cart with persistent session
- Secure checkout flow
- Customer account management
- Order history and tracking

#### Design System Highlights
- **Bold Typography**: Extra-bold fonts with strategic uppercase treatments
- **Vibrant Colors**: High-energy palette (electric yellow, cyan blue, bold red)
- **Dynamic Animations**: Continuous motion ribbons and scroll-triggered effects
- **Interactive Feedback**: Hover states, scale transforms, and smooth transitions

## 🎨 Design System

The application features a custom design system built around theme park excitement:

### Color Palette
```css
--color-brand-yellow: #fff200    /* Electric yellow (primary) */
--color-brand-blue: #00cfff      /* Bright cyan blue */
--color-brand-red: #ed1c24       /* Bold red */
--color-brand-green: #8bc34a     /* Vibrant green */
--color-brand-pink: #ff6ec7      /* Hot pink */
```

### Typography Scale
- **Headlines**: Extra-bold weights (800-900) with large scale hierarchy
- **Body Text**: Clean, readable Inter font family
- **Interactive Elements**: Strategic uppercase for impact

### Animation Strategy
- Horizontal scrolling ribbons with configurable speeds
- Scroll-triggered video playback and content reveals
- Hover animations with scale transforms and color transitions
- Respect for user motion preferences

## 🧪 Testing

### Unit Tests
- Component testing with Vitest and React Testing Library
- Utility function testing
- Custom hooks testing

### End-to-End Tests
- Critical user journey testing with Playwright
- Party booking flow validation
- E-commerce checkout process testing

### Component Documentation
- Storybook stories for design system components
- Interactive component playground
- Design token documentation

## 📊 Performance Optimizations

- **Edge Runtime**: Deployed on Shopify Oxygen for global performance
- **Code Splitting**: Route-based code splitting with React Router
- **Image Optimization**: Responsive images with lazy loading
- **Caching Strategy**: Strategic use of cache policies for API requests
- **Bundle Analysis**: Webpack bundle analyzer for size optimization

## 🔧 Environment Setup

### Required Environment Variables
```bash
SESSION_SECRET=your-session-secret
PUBLIC_STOREFRONT_API_TOKEN=your-public-token
PRIVATE_STOREFRONT_API_TOKEN=your-private-token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your-account-api-url
```

### Customer Account API Setup
Follow the [Shopify Customer Account API guide](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen) for public domain setup required for customer authentication features.

## 🚦 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Code Quality**: All code passes ESLint and TypeScript checks
3. **Testing**: Write unit tests for new components and utilities  
4. **Integration**: End-to-end tests validate critical user journeys
5. **GraphQL**: Run codegen after modifying GraphQL queries
6. **Deployment**: Automatic deployment via GitHub Actions to Oxygen

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 6+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Run quality checks (`npm run lint`, `npm run typecheck`)
5. Submit a pull request

## 📄 License

This project is for portfolio demonstration purposes.

---

Built with ❤️ using Shopify Hydrogen and React Router