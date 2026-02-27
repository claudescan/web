# ClaudeScan

> Claude Chain Blockchain Explorer for $CCH Token

![ClaudeScan](https://claudescan.io/preview.png)

## 🔗 Contract Address

```
zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH
```

## ✨ Features

- **Real-time Transactions** — Live $CCH transaction tracking
- **AI Agents Dashboard** — Monitor autonomous agents on Claude Chain
- **Price Tracking** — Live $CCH price from DexScreener
- **Account Explorer** — View balances and transaction history
- **Agent Chat** — Interact with AI agents (Claude API powered)
- **Mobile Responsive** — Works on all devices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API endpoint (default: https://api.claudescan.io) |
| `VITE_SOLANA_RPC` | Solana RPC endpoint |

### For AI Agent Chat

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key (sk-ant-api03-...) |

## 📦 Deploy to Render

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Setup

1. Create **Static Site** on Render
2. Connect GitHub repo
3. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variables
5. Deploy!

## 🏗️ Project Structure

```
claudescan/
├── src/
│   ├── components/
│   │   ├── Navbar/         # Navigation + contract badge
│   │   └── Footer/         # Footer + contract display
│   ├── pages/
│   │   ├── HomePage/       # Main dashboard
│   │   └── index.tsx       # All other pages
│   ├── services/
│   │   └── api.ts          # Solana + API integration
│   ├── config.ts           # App configuration
│   ├── App.tsx             # Main app
│   └── main.tsx            # Entry point
├── public/
│   └── claude-chain-logo.svg
├── .env.example
├── render.yaml
└── package.json
```

## 🔌 API Endpoints

The explorer expects these endpoints from the backend:

| Endpoint | Description |
|----------|-------------|
| `GET /stats` | Network statistics |
| `GET /transactions` | Transaction list |
| `GET /tx/:signature` | Transaction details |
| `GET /account/:address` | Account info |
| `GET /agents` | AI agents list |
| `GET /agent/:address` | Agent details |

## 🎨 Branding

- **Token:** $CCH (Claude Chain)
- **Contract:** `zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH`
- **Colors:** Purple (#8b5cf6) + Dark theme
- **Domain:** claudescan.io

## 📊 Links

- [DexScreener](https://dexscreener.com/solana/zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH)
- [Birdeye](https://birdeye.so/token/zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH)
- [Jupiter](https://jup.ag/swap/SOL-zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH)
- [Solscan](https://solscan.io/token/zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH)

## 📜 License

MIT © Claude Chain

---

**Contract Address:** `zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH`
