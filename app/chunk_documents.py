from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.load_documents import load_documents


def chunk_documents():
    documents = load_documents()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        length_function=len,
    )

    chunks = []

    for document in documents:
        document_chunks = splitter.create_documents(
            texts=[document["text"]],
            metadatas=[{"source": document["source"]}],
        )

        for index, chunk in enumerate(document_chunks):
            chunk.metadata["chunk_index"] = index
            chunk.metadata["chunk_id"] = (
                f"{document['source']}::chunk-{index}"
            )

        chunks.extend(document_chunks)

    return chunks


if __name__ == "__main__":
    chunks = chunk_documents()

    print(f"Total chunks: {len(chunks)}")

    if chunks:
        print(f"Metadata: {chunks[0].metadata}")
        print(f"Preview:\n{chunks[0].page_content[:800]}")