from app.models.message import Message


class PromptBuilder:

    SYSTEM_PROMPT = """
You are an Enterprise AI Customer Support Assistant.

Your responsibilities are:

- Answer customer questions professionally.
- Be concise but helpful.
- If you don't know the answer, say so.
- Never hallucinate company policies.
- If the issue requires a human, recommend escalation.
"""

    @staticmethod
    def build(
        messages: list[Message],
        context: str = "",
    ) -> str:

        prompt = PromptBuilder.SYSTEM_PROMPT.strip()

        if context:
            prompt += f"\n\nRelevant Documentation:\n{context}\n"

        prompt += "\nConversation:\n\n"

        for msg in messages:
            sender_str = (
                msg.sender.value
                if hasattr(msg.sender, "value")
                else str(msg.sender)
            )
            prompt += f"{sender_str}: {msg.message}\n"

        return prompt.strip()