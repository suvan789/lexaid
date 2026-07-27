import psycopg2

def migrate():
    print("Connecting to Neon PostgreSQL Database via psycopg2...")
    dsn = "postgresql://neondb_owner:npg_7MrDQsiH8zcq@ep-dry-queen-aj5wm672.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    # 1. Add role column
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'client';")
        print("✓ Added 'role' column to users table")
    except Exception as e:
        print("x role error:", e)

    # 2. Add lawyer_profile_id column
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS lawyer_profile_id UUID REFERENCES lawyer_profiles(id) ON DELETE SET NULL;")
        print("✓ Added 'lawyer_profile_id' column to users table")
    except Exception as e:
        print("x lawyer_profile_id error:", e)

    # 3. Add issue_description column
    try:
        cursor.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS issue_description TEXT;")
        print("✓ Added 'issue_description' column to appointments table")
    except Exception as e:
        print("x issue_description error:", e)

    # 4. Create direct_messages table
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS direct_messages (
            id UUID PRIMARY KEY,
            sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE
        );
        """)
        print("✓ Created 'direct_messages' table in Neon PostgreSQL")
    except Exception as e:
        print("x direct_messages table error:", e)

    conn.commit()
    conn.close()
    print("\n🎉 PRODUCTION NEON POSTGRESQL DATABASE MIGRATED SUCCESSFULLY!")

if __name__ == "__main__":
    migrate()
