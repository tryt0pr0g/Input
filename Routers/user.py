from fastapi import APIRouter
from starlette.responses import JSONResponse
from starlette.templating import Jinja2Templates

from sqlalchemy import func, select, and_, update

from dependencies import db_dependency

from DBModels.model import User, Text

from Schemes.user import SchemeTextSend, SchemeUser

from secrets import token_urlsafe


user_router = APIRouter()
templates = Jinja2Templates(directory='templates')


@user_router.post(path='/authUser',
                  response_class=JSONResponse,
                  tags=["user", "admin"],
                  summary="Авторизация пользователя")
async def auth_user(user: SchemeUser, db : db_dependency) -> JSONResponse:

    if db.execute(select(User).where(User.login == user.login)).first() is None:
        return JSONResponse(content={"error": "Неверный логин"}, status_code=404)

    user_token = token_urlsafe(32)
    db.execute(update(User).where(and_(User.login == user.login, User.password == user.password)).values(user_token=user_token))

    db.commit()

    return JSONResponse(content={"user_token": user_token}, status_code=201)


@user_router.get(path='/get_random_text',
                 response_class=JSONResponse,
                 tags=["user", "admin"],
                 summary="Получение случайного текста для игры")
async def get_rand_text(db: db_dependency) -> JSONResponse:
    result = db.query(Text).where(Text.is_accept == 1).order_by(func.random()).first()
    if result:
        return JSONResponse(content={"text": result.text})
    return JSONResponse(content={"error": "No text found"}, status_code=404)


@user_router.post(path='/regUser',
                  response_class=JSONResponse,
                  tags=["user", "admin"],
                  summary="Регистрация пользователя")
async def reg_user(user: SchemeUser, db : db_dependency) -> JSONResponse:
    all_logins = db.execute(select(User.login)).scalars().all()

    if user.login not in all_logins:
        new_user = User(login=user.login, user_token=token_urlsafe(32), password=user.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return JSONResponse(content={"user_token": str(new_user.user_token)})
    return JSONResponse(content={"error": "Такой логин уже занят"}, status_code=404)


@user_router.post(path='/postNewText',
                  response_class=JSONResponse,
                  tags=["user", "admin"],
                  summary="Отправка текста на рассмотрение")
async def post_new_text(text: SchemeTextSend, db: db_dependency) -> JSONResponse:
    user_id = db.execute(select(User.user_id).where(User.user_token == text.user_token)).first()
    if user_id is not None:
        all_texts = db.execute(select(Text.text)).scalars().all()

        if text.text not in all_texts:
            new_text = Text(text=text.text, user_id=user_id[0])
            db.add(new_text)
            db.commit()
            db.refresh(new_text)
            return JSONResponse(content={"result": "Текст успешно добавлен"}, status_code=201)
        return JSONResponse(content={"result": "Такой текст уже существует"}, status_code=404)
    return JSONResponse(content={"result": "Такого пользователя не существует"}, status_code=404)


@user_router.post(path='/userIsBlocked',
                  response_class=JSONResponse,
                  tags=["user", "admin"],
                  summary="Проверка на блокировку пользователя")
async def user_is_blocked(data: SchemeUser, db: db_dependency) -> JSONResponse:
    result = db.execute(select(User.is_blocked).where(User.user_token == data.user_token)).first()
    if result:
        return JSONResponse(content={"is_blocked": True if result[0] == 1 else False})

    return JSONResponse(content={"error": "Пользователя с таким токеном не существует"}, status_code=200)


@user_router.post(path='/userIsAdmin',
                  response_class=JSONResponse,
                  tags=["user", "admin"],
                  summary="Проверка пользователя на роль")
async def user_is_admin(is_admin: SchemeUser, db: db_dependency) -> JSONResponse:
    try:
        result = await user_is_admin_(is_admin.user_token, db)

        return JSONResponse(content={"is_admin": result}, status_code=201)
    except:
        return JSONResponse(content={"is_admin": False}, status_code=201)


async def user_is_admin_(user_token: str, db: db_dependency) -> bool:
    user = db.execute(select(User).where(User.user_token == user_token)).scalars()

    if user is not None:
        if user.first().is_admin:
            return True

    return False