# 🏠 Hipotrack - Mortgage Application Management Platform

<div align="center">

![Hipotrack Logo](https://img.shields.io/badge/Hipotrack-Mortgage%20Management-blue?style=for-the-badge&logo=home)

**A modern, comprehensive platform for managing mortgage applications from start to finish**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.6-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Hipotrack is a comprehensive mortgage application management platform designed to streamline and digitize the mortgage process. It provides a transparent, user-friendly interface for all stakeholders involved in the mortgage application journey - from homebuyers and real estate agents to lenders and loan processors.

The platform offers real-time tracking, document management, secure communication, and progress visualization to make the mortgage application process more efficient and transparent.

## ✨ Features

### 🏡 For Homebuyers
- **Interactive Timeline**: Visual progress tracking through all mortgage stages
- **Document Management**: Upload, track, and manage all required documents
- **Real-time Updates**: Get notified about application status changes
- **Cost Breakdown**: Transparent view of all mortgage-related costs
- **Secure Messaging**: Direct communication with agents, lenders, and processors

### 🏢 For Real Estate Professionals
- **Multi-client Management**: Handle multiple mortgage applications
- **Document Verification**: Review and approve client documents
- **Progress Monitoring**: Track application status across all clients
- **Communication Hub**: Centralized messaging with all parties
- **Audit Trail**: Complete history of all actions and changes

### 🏦 For Lenders & Processors
- **Application Pipeline**: Manage applications through various stages
- **Document Review**: Streamlined document approval workflow
- **Risk Assessment**: Tools for evaluating loan applications
- **Compliance Tracking**: Ensure all regulatory requirements are met
- **Reporting Dashboard**: Analytics and insights on application processing

### 🔒 Security Features
- **Role-based Access Control**: Secure access based on user roles
- **Audit Logging**: Complete trail of all system activities
- **Secure Document Storage**: Encrypted document handling
- **Authentication**: Multi-factor authentication support
- **Data Privacy**: GDPR-compliant data handling

## 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks and concurrent features
- **TypeScript 5.8.2** - Type-safe JavaScript development
- **Vite 6.2.3** - Fast build tool and development server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible, headless UI components
- **Framer Motion** - Smooth animations and transitions

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Real-time subscriptions** - Live updates across the application
- **Row Level Security** - Database-level access control
- **Edge Functions** - Serverless functions for business logic

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Storybook** - Component development and documentation
- **Tempo DevTools** - Development and prototyping tools
- **React Hook Form + Zod** - Form handling and validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hipotrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment variables**
   Edit `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_PROJECT_ID=your_project_id
   ```

## ⚙️ Configuration

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up your database schema** (see `/database` folder for SQL scripts)
3. **Configure Row Level Security** policies
4. **Set up authentication** providers
5. **Generate TypeScript types** (requires the Supabase CLI and the `SUPABASE_PROJECT_ID` environment variable):
   ```bash
   export SUPABASE_PROJECT_ID=your_project_id
   npm run types:supabase
   ```

### Development Configuration

The application uses several configuration files:

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui component configuration

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## 📁 Project Structure

```
hipotrack/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── security/      # Security-related components
│   │   └── ...            # Feature-specific components
│   ├── pages/             # Page components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── stories/           # Storybook stories
│   └── tempobook/         # Tempo development files
├── database/              # Database schema and migrations
├── docs/                  # Documentation
└── ...                    # Configuration files
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run types:supabase` | Generate Supabase TypeScript types |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all linting checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

<div align="center">

**Built with ❤️ for the mortgage industry**

[Website](https://hipotrack.com) • [Documentation](https://docs.hipotrack.com) • [Support](https://support.hipotrack.com)

</div>
