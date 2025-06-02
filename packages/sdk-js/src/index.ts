type EventPayload = {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  userId?: string;
};

export default class StreamorySDK {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint = "http://localhost:3000/v1/events") {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async track(eventName: string, properties: Record<string, any> = {}) {
    const payload: EventPayload = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(`[StreamorySDK] Failed to track event: ${res.statusText}`);
      }
    } catch (err) {
      console.error("[StreamorySDK] Network error:", err);
    }
  }
}
