import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, JSON,
    Uuid, Integer, Float, Boolean, ARRAY
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    generated_docs = relationship("GeneratedDocument", back_populates="user", cascade="all, delete-orphan")
    forum_posts = relationship("ForumPost", back_populates="user", cascade="all, delete-orphan")
    forum_replies = relationship("ForumReply", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    document_type = Column(String(100), nullable=True)
    overall_risk = Column(String(10), nullable=True)
    risk_summary = Column(Text, nullable=True)
    analysis_json = Column(JSON, nullable=True)
    document_text = Column(Text, nullable=True)
    language = Column(String(20), default="english")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="documents")

    def __repr__(self):
        return f"<Document {self.filename}>"


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    form_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="generated_docs")

    def __repr__(self):
        return f"<GeneratedDocument {self.title}>"


class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    specialization = Column(JSON, nullable=True)  # stored as JSON array for SQLite
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    experience_years = Column(Integer, nullable=False)
    fee_min = Column(Integer, nullable=False)
    fee_max = Column(Integer, nullable=False)
    fee_currency = Column(String(10), default="INR")
    rating = Column(Float, default=4.0)
    reviews_count = Column(Integer, default=0)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<LawyerProfile {self.name}>"


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="general")
    tags = Column(JSON, nullable=True)  # stored as JSON array for SQLite
    views = Column(Integer, default=0)
    upvotes = Column(Integer, default=0)
    is_answered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ForumPost {self.title}>"


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(Uuid(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    post = relationship("ForumPost", back_populates="replies")
    user = relationship("User", back_populates="forum_replies")

    def __repr__(self):
        return f"<ForumReply {self.id}>"


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    source = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    category = Column(String(100), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    scraped_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<NewsArticle {self.title}>"


class SavedLawyer(Base):
    __tablename__ = "saved_lawyers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(Uuid(as_uuid=True), ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="saved_lawyers")
    lawyer = relationship("LawyerProfile")


class SavedNews(Base):
    __tablename__ = "saved_news"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    news_id = Column(Uuid(as_uuid=True), ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="saved_news")
    news = relationship("NewsArticle")


class SavedForumPost(Base):
    __tablename__ = "saved_forum_posts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Uuid(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="saved_posts")
    post = relationship("ForumPost")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(Uuid(as_uuid=True), ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="pending")  # pending, confirmed, cancelled
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="appointments")
    lawyer = relationship("LawyerProfile")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="system")  # appointment, forum, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="notifications")
