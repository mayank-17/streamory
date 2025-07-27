import asyncio
import aiohttp
import uuid
import random
import json
import time
from datetime import datetime

# === Config ===
URL = "http://localhost:3001/v1/ingest"
HEADERS = {"Content-type": "application/json"}

LOGS_PER_SEC = 5000  # How many logs per second
DURATION = 10  # How long to run (seconds)
BATCH_SIZE = 100  # How many events to send concurrently in each micro-batch


def generate_event():
    return {
        "user_id": str(uuid.uuid4()),
        "event": random.choice(
            [
                "user_signed_up",
                "item_added_to_cart",
                "page_viewed",
                "payment_initiated",
                "notification_clicked",
            ]
        ),
        "action": random.choice(
            [
                "create_user_account",
                "send_email_verification",
                "process_payment",
                "update_user_profile",
                "log_out_user",
            ]
        ),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
    }


async def send_event(session, data):
    try:
        async with session.post(URL, json=data) as resp:
            return resp.status == 200
    except Exception:
        return False


async def send_batch(session, batch_size):
    tasks = [send_event(session, generate_event()) for _ in range(batch_size)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return sum(1 for r in results if r is True)


async def run_rate_limited():
    connector = aiohttp.TCPConnector(limit=0)
    total_sent = 0

    async with aiohttp.ClientSession(connector=connector, headers=HEADERS) as session:
        for sec in range(DURATION):
            start_sec = time.time()
            remaining = LOGS_PER_SEC
            while remaining > 0:
                batch = min(BATCH_SIZE, remaining)
                sent = await send_batch(session, batch)
                total_sent += sent
                remaining -= batch
            elapsed = time.time() - start_sec
            sleep_for = max(0, 1.0 - elapsed)
            await asyncio.sleep(sleep_for)

    print(f"✅ Done: Sent {total_sent} events in {DURATION} seconds")
    print(f"⚡ Effective rate: {total_sent / DURATION:.2f} req/sec")


asyncio.run(run_rate_limited())
