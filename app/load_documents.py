import re
from pathlib import Path

COURSE_DIR = (
    Path(__file__).resolve().parents[1]
    / "documents"
    / "ai-engineering-from-scratch"
)


def clean_text(text: str) -> str:
    text = re.sub(
        r"<picture\b[^>]*>.*?</picture>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )

    return text.strip()


def load_documents() -> list[dict[str, str]]:
    if not COURSE_DIR.is_dir():
        raise FileNotFoundError(
            f"Course directory not found: {COURSE_DIR}"
        )

    paths = [
        COURSE_DIR / "README.md",
        COURSE_DIR / "ROADMAP.md",
        *sorted(COURSE_DIR.glob("phases/*/README.md")),
        *sorted(COURSE_DIR.glob("phases/*/*/docs/en.md")),
    ]

    documents = []

    for path in paths:
        if not path.is_file():
            continue

        text = clean_text(path.read_text(encoding="utf-8"))

        if not text:
            continue

        documents.append({
            "source": path.relative_to(COURSE_DIR).as_posix(),
            "text": text,
        })

    return documents


if __name__ == "__main__":
    documents = load_documents()

    print(f"Loaded {len(documents)} documents")

    for document in documents[:5]:
        print(
            f"{document['source']}: "
            f"{len(document['text'])} characters"
        )

    if documents:
        print(f"\nFirst document preview:\n{documents[0]['text'][:800]}")