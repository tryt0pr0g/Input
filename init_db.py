from database import SessionLocal, ModelORM, engine
from DBModels.model import User, Text

# Создаём все таблицы (если их ещё нет)
ModelORM.metadata.create_all(bind=engine)

# Открываем сессию
db = SessionLocal()

# Проверим, есть ли уже админ, чтобы не вставлять повторно
admin = db.query(User).filter_by(login='admin').first()
if not admin:
    admin = User(
        login='admin',
        password='admin',
        user_token='FUiHhQ9kylWZ6XL1VMe0fE26ChsnhcoX7fjC7C9Jr3Q',
        is_blocked=0,
        is_admin=1
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"Добавлен пользователь: {admin.login}")

# Добавим тексты (если ещё нет)
texts_data = [
    ('Скоро начнётся приключение', 1, 1),
    ('Викинг готов к бою', 1, 1),
    ('', 1, 1),
    ('Вперёд, к новым землям!', 1, 1),
    ('Враг приближается с юга', 1, 1)
]

for text_value, user_id, is_accept in texts_data:
    if not db.query(Text).filter_by(text=text_value).first():
        db.add(Text(text=text_value, user_id=user_id, is_accept=is_accept))

db.commit()
print("✅ Данные успешно добавлены!")

db.close()
