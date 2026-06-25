import requests
from dotenv import load_dotenv
import os
from telegram import Bot
import asyncio

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

bot=Bot(token=BOT_TOKEN)

async def send_alert(message):
    await bot.send_message(
        chat_id=CHAT_ID,
        text=message
    )

def send_telegram_alert(message):
    asyncio.run(send_alert(message))