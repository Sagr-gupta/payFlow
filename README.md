# Project Bolt

A payment request management system built with React, TypeScript, and Supabase.

## Features

- User authentication and role-based access control
- Payment request creation and management
- Bill image upload and storage
- Payment approval workflow
- Comments and review system
- Excel export functionality
- Responsive design

## Tech Stack

- React
- TypeScript
- Supabase (Authentication, Database, Storage)
- Tailwind CSS
- Zustand (State Management)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-bolt.git
cd project-bolt
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # State management
├── types/         # TypeScript interfaces
├── utils/         # Utility functions
└── lib/          # Third-party library configurations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 