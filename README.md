# DeliveringTogether Apps Monorepo

This monorepo contains multiple applications and shared packages for DeliveringTogether.

## Structure

```
deliveringtogether-apps/
├── apps/
│   ├── coaching/           # Coaching question bank app
│   ├── feedbackforge/      # Feedback generator app
│   └── [future-apps]/      # Placeholder for future apps
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── auth/               # Shared Supabase auth
│   └── utils/              # Shared utilities
├── netlify.toml            # Root Netlify configuration
├── package.json            # Root package file
└── README.md               # This documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v7+) or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/deliveringtogether-apps.git

# Navigate to the project directory
cd deliveringtogether-apps

# Install dependencies
npm install
```

### Development

```bash
# Run the coaching app locally
npm run dev:coaching

# Build the coaching app
npm run build:coaching

# Add more commands as you add more apps
```

## Adding a New App

1. Create a new directory in the `apps/` folder
2. Set up the app-specific configuration files
3. Add scripts to the root package.json

## Environment Variables

Each app needs its own environment variables for deployment. For local development, create a `.env` file in each app's directory.

### Coaching App Variables

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deployment

Each app in the monorepo deploys independently to Netlify:

1. The root `netlify.toml` sets up routing between apps
2. Each app has its own `netlify.toml` for app-specific configurations
3. The build process only rebuilds apps that have changed

## Contributing

Please follow the contribution guidelines when adding to this repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.