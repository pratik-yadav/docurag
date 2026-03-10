from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from src.ai.embeddings import get_vector_store
from src.utils.settings import settings

llm = ChatGroq(
    # model="llama-3.3-70b-versatile",
    model="llama-3.1-8b-instant",
    api_key=settings.GROQ_API_KEY
)


def build_chat_history(history: list) -> list:
    messages = []
    for entry in history:
        if isinstance(entry, dict):
            question = entry.get("question", "")
            answer = entry.get("answer", "")
        else:
            question = entry.question
            answer = entry.answer or ""
        messages.append(HumanMessage(content=question))
        messages.append(AIMessage(content=answer))
    return messages


def ask_document(question: str, collection_name: str, history: list) -> str:
    vector_store = get_vector_store(collection_name)
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    relevant_docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])

    messages = [
        SystemMessage(content=(
            "You are a helpful assistant. Answer the user's question using "
            "only the context provided below.\n\n"
            f"Context:\n{context}"
        )),
        *build_chat_history(history),
        HumanMessage(content=question),
    ]

    response = llm.invoke(messages)
    return response.content