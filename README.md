# Airer 1.0 - AI Character Chat Platform

A production-ready web application where users can create multiple AI characters with unique personalities and chat with them. Features long-term memory using pgvector, WhatsApp-style chat export, and a futuristic metaverse UI built with React Three Fiber.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), JavaScript, TailwindCSS, React Three Fiber, Framer Motion
- **Backend**: Supabase (Postgres + pgvector + Edge Functions)
- **AI**: Google Gemini 2.0 Flash (Chat) + Text Embedding 004 (Vector embeddings)
- **State Management**: Zustand
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## 📁 Project Structure

```
airer-app/
├── app/
│   ├── auth/
│   │   ├── login/page.js          # Login page
│   │   └── signup/page.js         # Signup page
│   ├── chat/
│   │   └── [id]/page.js           # Character chat page
│   ├── dashboard/
│   │   └── page.js                # Main dashboard
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Landing/redirect page
│   └── globals.css                # Global styles
├── components/
│   ├── metaverse/
│   │   ├── AvatarSphere.js        # 3D character avatar
│   │   └── ParticleBackground.js   # Animated particle background
│   ├── CharacterCard.js            # Character display card
│   ├── ChatInput.js                # Message input component
│   ├── ChatMessage.js              # Message bubble component
│   └── CreateCharacterModal.js     # Character creation modal
├── lib/
│   ├── supabase/
│   │   ├── api.js                 # API functions
│   │   ├── client.js              # Browser Supabase client
│   │   └── server.js              # Server Supabase client
│   └── utils/
│       └── export.js              # WhatsApp export utilities
├── store/
│   ├── authStore.js               # Auth state management
│   ├── characterStore.js          # Character state management
│   └── chatStore.js               # Chat state management
├── supabase/
│   ├── functions/
│   │   ├── chat/index.ts          # Streaming chat endpoint
│   │   ├── embed/index.ts         # Vector embedding generator
│   │   └── memory-extract/index.ts # Memory extraction
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── package.json
├── next.config.js
├── tailwind.config.js
└── .env.local.example
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- Google Gemini API key (provided)

### 2. Supabase Setup

#### A. Create a new Supabase project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and create

#### B. Enable pgvector extension

1. Go to Database → Extensions
2. Search for "vector"
3. Enable the `vector` extension

#### C. Run the migration

1. Go to SQL Editor
2. Create a new query
3. Copy the entire content from `supabase/migrations/20240101000000_initial_schema.sql`
4. Run the query

#### D. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set environment variables for Edge Functions
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here

# Deploy all functions
supabase functions deploy chat
supabase functions deploy embed
supabase functions deploy memory-extract
```

#### E. Get your Supabase credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Local Development Setup

```bash
# Navigate to the project directory
cd airer-app

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local

# Edit .env.local with your credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Run development server
npm run dev
```

Open http://localhost:3000

### 4. Vercel Deployment

#### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
4. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## 🎮 Features

### 1. Character Management
- Create unlimited AI characters
- Customize personality traits (Tone, Humor, Formality, Creativity)
- Base characters on famous personalities (Tony Stark, Sherlock Holmes, etc.)
- Upload custom avatars
- Edit and delete characters

### 2. Intelligent Chat System
- **Real-time streaming responses** from Gemini AI
- **Long-term memory** using vector embeddings
- **Context-aware conversations** with memory retrieval
- **Personality-driven responses** based on character configuration
- **Memory extraction** from conversations

### 3. Memory System
- **Vector embeddings** for semantic memory search
- **Automatic memory extraction** from conversations
- **Memory types**: Facts, Preferences, Behaviors, Emotions
- **Relevance scoring** and access tracking
- **Persistent across sessions**

### 4. WhatsApp Integration
- Export chats in WhatsApp format
- Copy to clipboard
- Share directly via WhatsApp
- Preserves timestamps and formatting

### 5. Futuristic Metaverse UI
- **3D animated character avatars** with React Three Fiber
- **Particle background** effects
- **Neon glow** styling
- **Glass morphism** effects
- **Smooth animations** with Framer Motion

## 🔧 Configuration

### Character Personality Traits

Each character has 4 customizable traits (1-10 scale):

- **Tone**: Reserved (1) → Expressive (10)
- **Humor**: Serious (1) → Playful (10)
- **Formality**: Casual (1) → Formal (10)
- **Creativity**: Practical (1) → Imaginative (10)

### Memory System Configuration

Default settings in `match_memories` function:
- `match_threshold`: 0.7 (70% similarity)
- `match_count`: 5 (top 5 relevant memories)
- `message_limit`: 10 (recent message window)

Modify in `supabase/migrations/20240101000000_initial_schema.sql`

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation**: Users can only access their own data
- **Secure authentication** via Supabase Auth
- **API key protection** via environment variables
- **CORS configuration** for Edge Functions

## 📊 Database Schema

### Tables

- **characters**: AI character configurations
- **messages**: Chat message history
- **memories**: Vector embeddings for long-term memory

### Key Functions

- `match_memories()`: Vector similarity search
- `get_recent_messages()`: Fetch conversation history
- `update_memory_access()`: Track memory usage

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to Supabase"**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are in place

**2. "Chat streaming not working"**
- Verify Edge Functions are deployed
- Check GEMINI_API_KEY is set in Supabase secrets
- Verify CORS headers in Edge Functions

**3. "3D components not rendering"**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check Three.js transpiling in next.config.js

**4. "Memory search returns no results"**
- Ensure pgvector extension is enabled
- Check vector index exists
- Verify embeddings are being generated

## 📝 Environment Variables

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Gemini API (for client-side calls if needed)
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

For Supabase Edge Functions (set via Supabase CLI):

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## 🚀 Production Checklist

- [ ] Supabase project created
- [ ] pgvector extension enabled
- [ ] Database migration run successfully
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Vercel project deployed
- [ ] SSL certificate active
- [ ] Test character creation
- [ ] Test chat streaming
- [ ] Test memory retrieval
- [ ] Test WhatsApp export

## 📈 Scalability Considerations

- **Edge Functions**: Auto-scale with Supabase
- **Database**: Configure connection pooling
- **Vector Index**: Tune IVFFlat lists parameter for dataset size
- **Rate Limiting**: Implement on Edge Functions if needed

## 🎨 Customization

### Changing Color Theme

Edit `tailwind.config.js`:

```javascript
colors: {
  neon: {
    blue: "#00f3ff",     // Change these values
    purple: "#bf00ff",
    pink: "#ff006e",
    green: "#39ff14",
  },
}
```

### Adding New Famous Characters

Edit `components/CreateCharacterModal.js`:

```javascript
const FAMOUS_CHARACTERS = [
  'Your Character Name',
  // Add more...
];
```

### Modifying AI Behavior

Edit system prompt in `supabase/functions/chat/index.ts` around line 102

## 📦 Dependencies

### Core
- next@15.0.3
- react@19.0.0-rc.0
- @supabase/supabase-js@^2.39.3
- @supabase/ssr@^0.1.0

### UI
- @react-three/fiber@^8.15.13
- @react-three/drei@^9.93.0
- three@^0.160.0
- framer-motion@^10.18.0
- lucide-react@^0.294.0

### State & Utils
- zustand@^4.4.7
- date-fns@^3.0.6

## 🤝 Support

For issues or questions:
1. Check this README first
2. Review Supabase logs (Dashboard → Logs)
3. Check Vercel deployment logs
4. Review Edge Function logs

## 📄 License

This is a custom project for educational and demonstration purposes.

---

**Built with ❤️ using Next.js, Supabase, and Google Gemini AI**
