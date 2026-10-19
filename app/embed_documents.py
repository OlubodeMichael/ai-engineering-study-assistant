import chromadb
from dotenv import load_dotenv
from openai import OpenAI

from app.chunk_documents import chunk_documents

BATCH_SIZE = 50
EMBEDDING_MODEL = "text-embedding-3-small"


def main():
    load_dotenv()

    openai_client = OpenAI()

    chroma_client = chromadb.HttpClient(
        host="localhost",
        port=8001,
    )

    collection = chroma_client.get_or_create_collection(
        name="ai-engineering-course",
        embedding_function=None,
    )

    chunks = chunk_documents()
    total_tokens = 0

    print(f"Total chunks to check: {len(chunks)}")

    for start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[start : start + BATCH_SIZE]

        batch_ids = [
            chunk.metadata["chunk_id"]
            for chunk in batch
        ]

        existing = collection.get(
            ids=batch_ids,
            include=[],
        )
        existing_ids = set(existing["ids"])

        pending = [
            chunk
            for chunk in batch
            if chunk.metadata["chunk_id"] not in existing_ids
        ]

        end = start + len(batch)

        if not pending:
            print(f"{end}/{len(chunks)} checked — already stored")
            continue

        texts = [chunk.page_content for chunk in pending]

        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts,
        )

        embeddings = [
            item.embedding
            for item in sorted(
                response.data,
                key=lambda item: item.index,
            )
        ]

        collection.upsert(
            ids=[
                chunk.metadata["chunk_id"]
                for chunk in pending
            ],
            documents=texts,
            metadatas=[
                chunk.metadata
                for chunk in pending
            ],
            embeddings=embeddings,
        )

        total_tokens += response.usage.total_tokens

        print(
            f"{end}/{len(chunks)} checked — "
            f"saved {len(pending)} new chunks"
        )

    print("\nIndexing complete.")
    print(f"Total stored chunks: {collection.count()}")
    print(f"Embedding tokens used this run: {total_tokens}")


if __name__ == "__main__":
    main()