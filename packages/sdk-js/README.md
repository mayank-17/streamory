# @mynq/streamory-sdk

**Streamory JavaScript SDK** — A lightweight SDK to track custom events and send them securely to your Streamory analytics backend.

---

## Installation

```bash
npm install @mynq/streamory-sdk
# or
yarn add @mynq/streamory-sdk
```
---

## Usage

```js
import StreamorySDK from "@mynq/streamory-sdk";

const sdk = new StreamorySDK(
    "your-api-key",
    "http://localhost:3000/v1/events"
);

// Track a custom event with optional properties
sdk.track("signup_click", { plan: "pro" });
```

---

## API

```js
new StreamorySDK(apiKey: string, endpoint?: string)
```

- `apiKey` — Your project’s API key for authentication (required).
- `endpoint` — The URL of your ingestion API. Defaults to `http://localhost:3000/v1/events`.

```js
track(eventName: string, properties?: object): Promise<void>
```

Sends a custom event with optional properties to your Streamory backend.

- `eventName` — Name of the event (e.g., `"signup_click"`).
- `properties` — Additional data related to the event.

---

## Features

- Sends events securely with Bearer token authentication.
- Minimal dependencies, lightweight footprint.
- Designed to integrate easily in browser and Node.js environments.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests. Please ensure your code adheres to the existing style and includes tests when applicable.

---

## License

MIT © Mayank
