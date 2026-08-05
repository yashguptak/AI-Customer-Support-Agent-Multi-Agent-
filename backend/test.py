from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq

load_dotenv()

client = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
)

response = client.invoke("Say hello in one sentence.")

print(response.content)