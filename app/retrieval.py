import chromadb
from dotenv import load_dotenv
from openai import OpenAI
import os

EMBEDDING_MODEL = "text-embedding-3-small"


def retrieve(question: str, top_k: int = 5) -> list[dict]:
    if not question.strip():
        raise ValueError("Question cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    load_dotenv()

    openai_client = OpenAI()

    chroma_client = chromadb.HttpClient(
        host=os.getenv("CHROMA_HOST", "localhost"),
        port=int(os.getenv("CHROMA_PORT", "8001")),
    )

    collection = chroma_client.get_collection(
        name="ai-engineering-course",
        embedding_function=None,
    )

    count = collection.count()

    if count == 0:
        return []

    # Use the same embedding model used during indexing.
    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=question,
    )

    query_embedding = response.data[0].embedding

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )

    matches = []

    for chunk_id, text, metadata, distance in zip(
        results["ids"][0],
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        matches.append({
            "id": chunk_id,
            "text": text,
            "metadata": metadata,
            "distance": distance,
        })

    return matches


if __name__ == "__main__":
    question = input("Ask a course question: ").strip()

    matches = retrieve(question)

    for index, match in enumerate(matches, start=1):
        print(f"\n--- Result {index} ---")
        print(f"Source: {match['metadata']['source']}")
        print(f"Chunk ID: {match['id']}")
        print(f"Distance: {match['distance']:.4f}")
        print(f"Text:\n{match['text']}\n")

    if not matches:
        print("No documents are indexed.")