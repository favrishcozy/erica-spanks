# Erica Spanks E-commerce Website

A modern, mobile-first e-commerce website for the confident women's fashion brand Erica Spanks, inspired by Oh Polly's design and functionality.

## 🌟 Brand Identity
- **Vision**: Confident, sexy, and comfortable fashion that makes women feel unstoppable
- **Aesthetic**: Clean, modern, feminine design with bold pink accents
- **Target**: Women seeking fashion that empowers and inspires confidence

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components + CSS-in-JS
- **State Management**: Zustand
- **Routing**: React Router v6
- **UI Components**: Custom components + Lucide React icons

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Payments**: Stripe integration
- **Email**: Nodemailer

### Key Features
- 📱 Mobile-first responsive design
- 🛒 Persistent shopping cart
- 🔐 User authentication & profiles
- 💳 Secure payment processing (Paystack)
- 📦 Lagos delivery system with zone-based pricing
- 🔍 Product search & filtering
- 💌 Newsletter subscription
- 📱 PWA support
- 🎁 Points & rewards system
- 🧾 Professional PDF invoices with auto-generated numbers
- 🛡️ Wishlist (authenticated users only)
- 👥 Admin dashboard with analytics & fee management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd erica-spanks
```

2. **Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend setup**
```bash
cd ../backend
npm install
npm run dev
```

4. **Environment Variables**
Create `.env` files in both frontend and backend directories

### Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
erica-spanks/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/     # Header, Footer, Navigation
│   │   │   ├── ui/         # Buttons, Inputs, etc.
│   │   │   ├── product/    # Product-related components
│   │   │   ├── cart/       # Shopping cart components
│   │   │   └── checkout/   # Checkout flow components
│   │   ├── pages/          # Route components ()
│   │   ├── stores/         # Zustand state stores
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles and theme
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration files
│   └── package.json
├── database/               # Database scripts and seeds
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: #FF69B4 (Hot Pink) - Brand color for CTAs and accents
- **Primary Dark**: #E91E63 - Hover states and emphasis
- **Primary Light**: #FFB6C1 - Backgrounds and subtle accents
- **Secondary**: #000000 - Text and high contrast elements
- **Accent**: #F8BBD9 - Soft pink for highlights

### Typography
- **Primary Font**: Montserrat - Clean, modern sans-serif
- **Secondary Font**: Playfair Display - Elegant serif for headings
- **Font Sizes**: 12px - 48px responsive scale

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Wide**: 1440px+

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow mobile-first responsive design
- Use semantic HTML elements
- Implement proper error handling
- Write descriptive commit messages

### Component Structure
- Keep components small and focused
- Use styled-components for styling
- Implement proper TypeScript types
- Include error boundaries where needed

### State Management
- Use Zustand for global state
- Keep local state minimal
- Persist important data (cart, auth)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Railway/Heroku)
```bash
cd backend
npm start
```

### Environment Variables
- See `.env.example` files for required variables
- Never commit sensitive keys to version control

## 📈 Performance Optimization

- Lazy loading for images and components
- Code splitting by routes
- Image optimization with Cloudinary
- PWA caching strategies
- Bundle size optimization

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test
```

### Backend
```bash
cd backend
npm run test
```

## 📞 Support

For development questions or issues:
- Check the documentation in `/docs`
- Review component examples in Storybook
- Follow the established patterns in existing code

---

Built with ❤️ for confident women everywhere.
