from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Add currency column to users table
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'"))
            conn.commit()
        print("Successfully added currency column to users table")
    except Exception as e:
        print(f"Error adding column (might already exist): {e}")
