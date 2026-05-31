import feedparser
import httpx
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from groq_service import summarize_news


RSS_FEEDS = [
    {"url": "https://www.livelaw.in/feed", "source": "LiveLaw"},
    {"url": "https://www.barandbench.com/feed", "source": "Bar & Bench"},
    {"url": "https://indianexpress.com/section/india/feed/", "source": "Indian Express"},
]

LEGAL_KEYWORDS = [
    "court", "judge", "law", "legal", "verdict", "petition", "bail",
    "supreme court", "high court", "bench", "advocate", "lawyer",
    "section", "act", "criminal", "civil", "constitution", "rights",
    "tribunal", "justice", "hearing", "appeal", "writ", "PIL",
    "consumer", "labour", "property", "divorce", "custody",
    "IPC", "CrPC", "FIR", "police", "arrest", "sentence",
]


def _is_legal_article(title: str, summary: str = "") -> bool:
    """Check if article is related to legal/law topics."""
    combined = (title + " " + summary).lower()
    return any(keyword in combined for keyword in LEGAL_KEYWORDS)


def _parse_date(entry) -> datetime:
    """Parse published date from RSS entry."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)


def _extract_text_from_html(html_content: str) -> str:
    """Extract plain text from HTML content."""
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ", strip=True)


async def scrape_legal_news() -> list:
    """
    Scrape legal news from RSS feeds, filter for legal content,
    and summarize each article using Groq.
    Returns list of dicts with title, summary, source, url, category, published_at.
    """
    articles = []

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        for feed_info in RSS_FEEDS:
            try:
                response = await client.get(feed_info["url"], headers={
                    "User-Agent": "Mozilla/5.0 (compatible; LexAid/1.0)"
                })
                if response.status_code != 200:
                    continue

                feed = feedparser.parse(response.text)

                for entry in feed.entries[:10]:  # Limit to 10 per feed
                    title = entry.get("title", "").strip()
                    entry_summary = entry.get("summary", "")
                    raw_text = _extract_text_from_html(entry_summary)

                    if not title:
                        continue

                    # Filter for legal content
                    if feed_info["source"] in ["LiveLaw", "Bar & Bench"]:
                        is_legal = True  # These are dedicated legal news sites
                    else:
                        is_legal = _is_legal_article(title, raw_text)

                    if not is_legal:
                        continue

                    # Determine category
                    category = _categorize_article(title, raw_text)

                    # Use raw text snippet for summary to save Groq API quota
                    ai_summary = raw_text[:250] + "..." if raw_text else title

                    articles.append({
                        "title": title,
                        "summary": ai_summary,
                        "source": feed_info["source"],
                        "url": entry.get("link", ""),
                        "category": category,
                        "published_at": _parse_date(entry),
                    })

            except Exception:
                continue  # Skip failed feeds silently

    return articles[:20]  # Return max 20 articles


def _categorize_article(title: str, text: str) -> str:
    """Categorize a legal news article based on content."""
    combined = (title + " " + text).lower()

    if "supreme court" in combined:
        return "Supreme Court"
    elif "high court" in combined:
        return "High Court"
    elif any(w in combined for w in ["consumer", "complaint", "refund"]):
        return "Consumer"
    elif any(w in combined for w in ["labour", "labor", "employee", "worker", "wage"]):
        return "Labour"
    elif any(w in combined for w in ["property", "land", "real estate", "tenant", "rent"]):
        return "Property"
    elif any(w in combined for w in ["criminal", "murder", "robbery", "theft", "IPC", "FIR"]):
        return "Criminal"
    else:
        return "General"
