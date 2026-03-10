from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
import tempfile
import os

CHROMA_DIR = "./chroma_store"

embeddings_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)


def get_vector_store(collection_name: str) -> Chroma:
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings_model,
        persist_directory=os.path.join(CHROMA_DIR, collection_name)
    )


def load_and_split_file(file_bytes: bytes, filename: str, content_type: str) -> list[Document]:
    suffix_map = {
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "text/plain": ".txt"
    }
    suffix = suffix_map.get(content_type, ".txt")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            loader = PyPDFLoader(tmp_path)
        elif suffix in (".doc", ".docx"):
            loader = Docx2txtLoader(tmp_path)
        else:
            loader = TextLoader(tmp_path)

        docs = loader.load()
    finally:
        os.unlink(tmp_path)

    for doc in docs:
        doc.metadata["source"] = filename

    return text_splitter.split_documents(docs)


def embed_and_store(file_bytes: bytes, filename: str, content_type: str, collection_name: str) -> int:
    chunks = load_and_split_file(file_bytes, filename, content_type)
    vector_store = get_vector_store(collection_name)
    vector_store.add_documents(chunks)
    return len(chunks)


def delete_collection(collection_name: str) -> None:
    import shutil
    path = os.path.join(CHROMA_DIR, collection_name)
    if os.path.exists(path):
        shutil.rmtree(path)


def get_collection_name(room_id: int | str) -> str:
    return f"chat_room_{room_id}"