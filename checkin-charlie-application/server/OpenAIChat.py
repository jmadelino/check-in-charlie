from openai import OpenAI


class OpenAIChat:
    def __init__(self, api_key):
        if not api_key:
            raise ValueError("OpenAI API key is required.")
        self.messages = []
        self.client = OpenAI()

    def reset_messages(self):
        """Clear chat history and reset it."""
        self.messages = []

    def add_system_message(self, content):
        """Add system message to the chat history."""
        self.messages.append({"role": "system", "content": content})

    def add_user_message(self, content):
        """Add user message to the chat history."""
        self.messages.append({"role": "user", "content": content})

    def request(self):
        """Send the request to OpenAI's API."""
        completion = self.client.chat.completions.create(
            model="gpt-4o", messages=self.messages
        )
        message_content = completion.choices[0].message.content
        self.add_assistant_message(message_content)
        return message_content

    def add_assistant_message(self, content):
        """Add assistant message to the chat history."""
        self.messages.append({"role": "assistant", "content": content})
