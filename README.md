# NOVA: AI-Native Identity Platform for Web3

NOVA is an AI-powered platform built on Solana that transforms wallet data into a living, expressive identity. Through a suite of generative tools — including natural language chat, AI-composed music, dynamic identity cards, and on-chain analytics — NOVA creates a personalized experience around each user's blockchain behavior.

---

## Overview

Modern Web3 platforms surface balances and transaction logs but fail to translate them into insight. Wallets are rich in data but void of identity, expression, or behavior-driven narrative.

Meanwhile, general-purpose LLMs such as ChatGPT, Claude, and Gemini, though powerful, are not trained to reason about on-chain activity or token structures. They cannot safely explain smart contracts or interpret decentralized interactions.

**NOVA addresses this gap by combining purpose-built AI tooling with blockchain-native data**, introducing the first modular AI identity system for Web3 users.

---

## Features

### Wallet Onboarding

- Support for Phantom, Solflare, Brave (traditional wallets)
- Smart wallet abstraction via LazorKit SDK (passkey login, no extensions, gasless)

### N.CHATBOT (AI Chat Assistant)

- LLaMA3-based assistant running on Groq
- Wallet summarization: interprets past transactions and token behavior
- Contract analysis: upload `.sol` or `.rs` files for function explanation
- Token safety scanning: highlights risks (e.g., mint authority, blacklistable)

### N.AURORA (Music Generator)

- Composes a custom AI-generated soundtrack based on user wallet behavior
- Tracks are mood-personalized (cinematic, lo-fi, glitch) and evolve over time
- Users can remix and regenerate tracks on demand

### Visual Identity Card

- AI-generated image (via Replicate) unique to each user
- Badge system based on behavioral milestones
- Rank progression: Echo → Pulse → Signal → Cipher → Nexus → Oracle → Sovereign
- Archetypes: Strategist, Collector, Degen, Explorer, etc.

### Platform Utilities

- Faucet: claim 10 $NOVA daily
- Devnet swap UI (SPL token ↔ $NOVA)
- Transfer SPL tokens to others
- DAO mock interface to propose/vote on features

### Dashboard & Profile

- Real-time NFT/token viewer (via Helius)
- AI chat memory and transaction timeline
- XP tracker and badge progression
- Profile export/sharing module (with embedded card and music)

---

## Architecture

Frontend       → Next.js + TailwindCSS  
Wallet Auth    → Phantom / Solflare / Brave + LazorKit SDK  
Chat Engine    → Groq + LLaMA3  
Image AI       → Replicate (API for image gen)  
Music AI       → MusicGen (soundtrack generation)  
Data Layer     → Supabase (XP, profile memory), Helius (on-chain wallet history)  
Blockchain     → Solana Devnet + SPL Tokens  

---

## Development Setup

### Requirements

- Node.js 18+
- Git
- Phantom Wallet OR biometric device (for LazorKit)

### Installation

```bash
git clone https://github.com/Panacea2005/NOVA
cd NOVA
npm install
cp .env.example .env.local
```

Edit `.env.local` with:

```env
GROQ_API_KEY=...
REPLICATE_API_KEY=...
NEXT_PUBLIC_LAZORKIT_CLIENT_ID=...
SUPABASE_URL=...
SUPABASE_KEY=...
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Run

```bash
npm run dev
```

---

## Live Demo

Devnet instance: [https://nova-ai.vercel.app](https://nova-ai.vercel.app)

Demo video: [link to YouTube or Loom]

---

## Tech Stack

- Groq – ultra-fast LLM inference  
- LLaMA3 – advanced open-source LLM  
- LazorKit – passkey smart wallet abstraction  
- Supabase – real-time DB for XP/memory  
- Helius – Solana wallet analysis  
- MusicGen – AI audio synthesis  
- Replicate – hosted AI image generation

---

## Team

This project was created by a team of 3 builders as part of the [Hackathon Name] 2024.

| Member        | Role                |
|---------------|---------------------|
| Thien   | PM & UI - UX Designer |
| Anh   | AI Engineer |
| Huyen   | Blockchain specialist |

---

## License

This repository is open source under the MIT License.

---

## Acknowledgments

Special thanks to Groq, LazorKit, Replicate, and the Solana Foundation for making their technologies publicly available and developer-friendly.

---

> Web3 identity doesn’t end with what you hold — it begins with what you become. NOVA brings meaning to your wallet.
