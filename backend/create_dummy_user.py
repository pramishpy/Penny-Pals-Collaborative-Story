from app import create_app, db
from app.models import User
from app.utils.helpers import generate_id

app = create_app()

with app.app_context():
    try:
        if not User.query.filter_by(username='bob').first():
            bob = User(
                id=generate_id(),
                username='bob',
                email='bob@example.com',
                name='Bob Builder'
            )
            bob.set_password('password')
            db.session.add(bob)
            db.session.commit()
            print("Created user Bob")
        else:
            print("User Bob already exists")
    except Exception as e:
        print(f"Error: {e}")
