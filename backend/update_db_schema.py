import asyncio
import sqlite3
import os

def update_sqlite():
    db_path = os.path.join(os.path.dirname(__file__), "lexaid.db")
    if not os.path.exists(db_path):
        print("lexaid.db not found, will be created on server startup.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add columns to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'client'")
        print("Added role to users table")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN lawyer_profile_id CHAR(36)")
        print("Added lawyer_profile_id to users table")
    except sqlite3.OperationalError:
        pass

    # Add issue_description to appointments table
    try:
        cursor.execute("ALTER TABLE appointments ADD COLUMN issue_description TEXT")
        print("Added issue_description to appointments table")
    except sqlite3.OperationalError:
        pass

    # Create direct_messages table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS direct_messages (
        id CHAR(36) PRIMARY KEY,
        sender_id CHAR(36) NOT NULL,
        receiver_id CHAR(36) NOT NULL,
        appointment_id CHAR(36),
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
    )
    """)
    print("Ensured direct_messages table exists")

    conn.commit()
    conn.close()
    print("SQLite Schema Update Complete.")

if __name__ == "__main__":
    update_sqlite()
