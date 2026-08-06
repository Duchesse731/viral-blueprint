# AI Storyboard

Create visual storyboards with AI-generated images, scene descriptions, and drag-and-drop panel management.

![AI Storyboard](https://via.placeholder.com/800x400?text=AI+Storyboard+Preview)

## Features

- 🎨 **AI Image Generation** - Generate stunning visuals using OpenAI's DALL-E 3
- 📝 **Scene Descriptions** - Add descriptions, dialogue, and production notes per panel
- 🔄 **Drag-and-Drop** - Easily reorder panels with smooth animations
- 💾 **Auto-Save** - All changes persist automatically to localStorage
- 📤 **Export/Import** - Share your storyboards as JSON files
- 🎯 **Style Memory** - Set visual style notes for consistent AI-generated images
- 📱 **Responsive** - Works on desktop and tablet devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-storyboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Storyboard

1. Click **"New Storyboard"** on the dashboard
2. Enter a title and optional description
3. Click **Create** to start building

### Adding Panels

1. Click **"Add Panel"** in your storyboard
2. Enter an AI image prompt describing your desired visual
3. Click **"Generate Image"** to create with DALL-E 3
4. Add scene description, dialogue, and production notes

### Setting Visual Style

1. Click the **Settings** icon (⚙️) in the header
2. Add style notes like "cinematic, warm lighting, 35mm film grain"
3. These notes are automatically included in AI generation prompts

### Reordering Panels

- Drag panels by the grip handle (⋮⋮) on the top-left
- Drop them in your desired order

### Exporting

1. Click **Export** in the header
2. Choose **Export as JSON** to download
3. Use **Import JSON** to load a previously exported storyboard

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New panel |
| `S` | Open settings |
| `E` | Export storyboard |
| `?` | Show shortcuts help |
| `Esc` | Close dialogs |

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [OpenAI DALL-E 3](https://openai.com/dall-e-3)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── storyboard/[id]/        # Editor pages
│   └── api/
│       └── generate-image/      # AI API routes
├── components/
│   ├── ui/                     # shadcn components
│   ├── PanelCard.tsx           # Panel display
│   ├── PanelEditor.tsx         # AI generation modal
│   └── SortablePanelGrid.tsx   # Drag-drop grid
├── lib/
│   ├── storage.ts               # localStorage persistence
│   └── utils.ts                # Utilities
└── types/
    └── storyboard.ts            # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add `OPENAI_API_KEY` environment variable
4. Deploy!

### Manual Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for DALL-E 3 | Yes |

## Troubleshooting

### "API key not configured"
Make sure you've added `OPENAI_API_KEY` to your `.env.local` file.

### Images not generating
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- DALL-E 3 has rate limits - wait a moment and try again

### Data lost
All data is stored in localStorage. Clearing browser data will remove storyboards. Use Export regularly to backup.

## License

MIT License
