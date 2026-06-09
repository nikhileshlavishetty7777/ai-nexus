# backend/database/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from loguru import logger
from .models import Base, AdminSetting, User, UserRole
from config import settings
from passlib.context import CryptContext
import os

# Create engine
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
    # Enable WAL mode for better SQLite concurrency
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables and seed default data."""
    logger.info("Initializing database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        _seed_admin_settings(db)
        _seed_admin_user(db)
        db.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        db.rollback()
    finally:
        db.close()

    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def _seed_admin_settings(db: Session):
    """Seed default admin settings."""
    defaults = [
        ("site_name", "AI Nexus", "string", "Site display name", "general"),
        ("site_description", "Advanced AI Chat Platform", "string", "Site description", "general"),
        ("max_message_length", "4000", "int", "Max chars per message", "limits"),
        ("max_chats_per_user", "100", "int", "Max chats per user", "limits"),
        ("allow_registration", "true", "bool", "Allow new registrations", "auth"),
        ("default_model", "gpt-4o-mini", "string", "Default AI model", "ai"),
        ("default_provider", "openai", "string", "Default AI provider", "ai"),
        ("openai_enabled", "true", "bool", "Enable OpenAI", "ai"),
        ("gemini_enabled", "true", "bool", "Enable Gemini", "ai"),
        ("maintenance_mode", "false", "bool", "Maintenance mode", "system"),
    ]
    for key, value, vtype, desc, cat in defaults:
        existing = db.query(AdminSetting).filter(AdminSetting.key == key).first()
        if not existing:
            db.add(AdminSetting(key=key, value=value, value_type=vtype, description=desc, category=cat))


def _seed_admin_user(db: Session):
    """Create default admin user if not exists."""
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.ADMIN_EMAIL,
            username="admin",
            full_name="System Admin",
            hashed_password=pwd_context.hash(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        logger.info(f"Admin user created: {settings.ADMIN_EMAIL}")
