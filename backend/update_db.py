from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE wallets ADD COLUMN bank_account VARCHAR(20)"))
            conn.commit()
        print("Successfully added bank_account column to wallets table.")
    except Exception as e:
        print(f"Error (column might already exist): {e}")
