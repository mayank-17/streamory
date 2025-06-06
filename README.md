<p align="left">
  <img src="/assets/logo/streamory-circular-logo.png" width="80" height="80" alt="Streamory Logo" style="border-radius: 50%;" />
</p>

<h1 align="left">Streamory</h1>

<p align="left">
  <i>Your real-time analytics backend platform — fast, flexible, and developer-friendly.</i>
</p>


## Why the Name "Streamory"?

We picked **Streamory** because it feels just right for whamv this project is all about:

- **Stream** stands for the continuous flow of data — like all those events and interactions happening in real time inside your app.
- **Story** hints at the bigger picture — the story your data tells about how users behave and how your product performs.

Put them together, and **Streamory** means a real-time memory for your product — helping teams see what’s happening, understand it quickly, and improve things faster.

### What’s with the Logo?

The logo’s wave shape is inspired by flowing streams of data — always moving, always fresh.

It’s a simple, clean symbol of how data pipelines work: smooth, flexible, and built to handle whatever you throw at them.

The blue gradient reflects qualities we care about: clarity, depth, and reliability — just like how we want your analytics to feel.

---

## 🧱 Monorepo Structure

```
streamory/
├── assets/logo/              # Branding assets
├── infra/                    # Docker Compose, Kubernetes files
├── packages/
│   └── sdk-js/               # Public JavaScript SDK
├── apps/
│   ├── ingestion-api/        # REST API to ingest events
│   ├── dashboard/            # (Planned) UI for viewing event data
│   └── processor/            # (Planned) Kafka consumer and transformation
├── README.md
└── .gitignore
```

---

## 📦 SDK (`@mynq/streamory-sdk`)

A lightweight, ESM-compatible SDK for tracking frontend events securely.

### ✅ Features

- Drop-in usage for browser apps
- Bearer token authentication
- Auto token refresh (optional)
- Minimal footprint
- Works with modern frameworks (React, Vue, etc.)

### 📥 Installation

```bash
npm install @mynq/streamory-sdk
```

### 🧪 Example

```ts
import StreamorySDK from "@mynq/streamory-sdk";

const sdk = new StreamorySDK("ACCESS_TOKEN", "https://api.streamory.com/v1/events");

sdk.track("user_signup", {
  plan: "Pro",
  referrer: "Twitter"
});
```

## 🔐 Auth Design

- Access Token + Refresh Token
- Tokens stored safely per project
- Refresh tokens used to renew expired access tokens
- SDK handles refresh automatically
- No hardcoding long-lived secrets in browser

---

## 🌐 Ingestion API

- Express-based ingestion endpoint
- Validates and queues events to Kafka
- Future: per-project key validation, rate limiting, quotas

### Planned Endpoints

- `POST /v1/events` - Ingests events
- `GET /v1/health` - Healthcheck
- `POST /v1/auth/token` - Refresh access tokens *(WIP)*

---

## 🛠️ Infrastructure

- Kafka for queuing
- ClickHouse for storage
- Docker + Kubernetes for orchestration
- Future: Support Helm Charts, Terraform module

---

## 🧭 Roadmap

- [x] Build and publish initial SDK
- [ ] Basic ingestion API with Kafka producer
- [ ] Token refresh and expiry logic
- [ ] Project dashboard with event explorer
- [ ] Real-time stream processor
- [ ] Hosted version of Streamory

---

## 🤝 Contributing

We welcome issues and PRs!

```bash
git clone https://github.com/mayank-17/streamory.git
cd packages/sdk-js
npm install
npm run dev
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for all commits.

---

## ⚖️ License

MIT © Mayank
