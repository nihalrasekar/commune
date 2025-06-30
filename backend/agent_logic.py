from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

llm = ChatOllama(model="gemma3")

def is_real_estate_question(query: str) -> bool:
    keywords = ["property", "apartment", "real estate", "investment", "rent", "location", "house", "buy"]
    return any(word in query.lower() for word in keywords)

def get_response(query: str, history: list) -> str:
    if not is_real_estate_question(query):
        return "Sorry, I can only help with real estate and property investment."

    prompt = f"""
    You are a helpful, crisp real estate expert.
    Respond in 1–2 short sentences. Only respond to real estate topics.
    Query: {query}
    """

    messages = [HumanMessage(content=prompt)]
    for msg in history[-4:]:
        messages.append(HumanMessage(content=msg['user']))
        messages.append(HumanMessage(content=msg['agent']))

    result = llm.invoke(messages)
    return result.content.strip()
