from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

admin = User(
    name="Administrator",
    email="admin@example.com",
    password_hash=hash_password("Admin@123"),
    role="admin",
)

db.add(admin)
db.commit()

print("Admin created successfully!")