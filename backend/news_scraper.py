import feedparser
import httpx
from datetime import datetime, timezone
from bs4 import BeautifulSoup

RSS_FEEDS = [
    {"url": "https://www.livelaw.in/feed", "source": "LiveLaw"},
    {"url": "https://www.barandbench.com/feed", "source": "Bar & Bench"},
    {"url": "https://news.google.com/rss/search?q=Supreme+Court+India+High+Court+legal&hl=en-IN&gl=IN&ceid=IN:en", "source": "Supreme Court Live"},
    {"url": "https://indianexpress.com/section/india/feed/", "source": "Indian Express"},
    {"url": "https://news.google.com/rss/search?q=Indian+Law+Court+verdict+bail&hl=en-IN&gl=IN&ceid=IN:en", "source": "Legal News India"},
]

LEGAL_KEYWORDS = [
    "court", "judge", "law", "legal", "verdict", "petition", "bail",
    "supreme court", "high court", "bench", "advocate", "lawyer",
    "section", "act", "criminal", "civil", "constitution", "rights",
    "tribunal", "justice", "hearing", "appeal", "writ", "pil",
    "consumer", "labour", "property", "divorce", "custody",
    "ipc", "crpc", "fir", "police", "arrest", "sentence", "bns", "bnss"
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
    Scrape live legal news from multiple RSS feeds, filter for legal content,
    and return up to 60 fresh articles.
    """
    articles = []
    seen_titles = set()

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        for feed_info in RSS_FEEDS:
            try:
                response = await client.get(feed_info["url"], headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
                if response.status_code != 200:
                    continue

                feed = feedparser.parse(response.text)

                for entry in feed.entries[:20]:
                    title = entry.get("title", "").strip()
                    entry_summary = entry.get("summary", "") or entry.get("description", "")
                    raw_text = _extract_text_from_html(entry_summary)

                    if not title or title.lower() in seen_titles:
                        continue

                    # Filter for legal content
                    if feed_info["source"] in ["LiveLaw", "Bar & Bench", "Supreme Court Live"]:
                        is_legal = True
                    else:
                        is_legal = _is_legal_article(title, raw_text)

                    if not is_legal:
                        continue

                    seen_titles.add(title.lower())
                    category = _categorize_article(title, raw_text)

                    # High quality clean summary snippet
                    ai_summary = raw_text[:280] + "..." if len(raw_text) > 280 else (raw_text or title)

                    articles.append({
                        "title": title,
                        "summary": ai_summary,
                        "source": feed_info["source"],
                        "url": entry.get("link", ""),
                        "category": category,
                        "published_at": _parse_date(entry),
                    })

            except Exception as e:
                print(f"Feed error ({feed_info['source']}):", e)
                continue

    # Sort by published_at descending
    articles.sort(key=lambda x: x["published_at"], reverse=True)
    return articles[:60]


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
    elif any(w in combined for w in ["criminal", "murder", "robbery", "theft", "ipc", "fir", "police", "arrest", "bns"]):
        return "Criminal"
    else:
        return "General"
