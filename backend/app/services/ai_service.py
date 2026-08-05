from langchain_groq import ChatGroq

from app.core.config import settings


class AIService:

    def __init__(self):
        self.model = ChatGroq(
            model=settings.LLM_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.2,
        )

    def generate_response(
        self,
        conversation_history: str,
    ) -> str:

        response = self.model.invoke(conversation_history)

        return response.content