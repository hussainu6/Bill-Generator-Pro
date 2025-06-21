# Invoice Generator Pro

A modern, feature-rich invoice generator built with React, TypeScript, and Tailwind CSS. Create professional invoices with ease using this comprehensive web application.

## ✨ Features

- **📄 Professional Invoice Templates** - Multiple beautiful templates to choose from
- **👤 Customer Management** - Store and manage customer information
- **📦 Product Catalog** - Maintain a database of products and services
- **💰 Advanced Calculations** - Automatic tax, discount, and total calculations
- **🎨 Custom Branding** - Upload your logo and customize colors
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **💾 Local Storage** - Save invoices and data locally
- **📊 Analytics Dashboard** - Track your invoicing metrics
- **🔍 Invoice History** - View and manage past invoices
- **⚙️ Settings Panel** - Customize your invoicing preferences

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd invoice-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── main.tsx           # Application entry point
```

## 🎨 Key Components

- **InvoiceBuilder** - Main invoice creation interface
- **InvoicePreview** - Real-time invoice preview
- **CustomerSection** - Customer information management
- **LineItemsSection** - Product/service line items
- **CalculationsSection** - Tax and discount calculations
- **AnalyticsDashboard** - Business insights and metrics
- **SettingsPanel** - Application configuration

## 🔧 Configuration

The application uses several configuration files:

- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deploy to GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist/` folder to your repository
3. Configure GitHub Pages to serve from the `dist/` directory

### Deploy to Vercel/Netlify

Simply connect your repository and the platform will automatically build and deploy your application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ using React, TypeScript, and Tailwind CSS**
