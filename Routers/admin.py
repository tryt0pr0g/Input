from fastapi import APIRouter, Request
from starlette.responses import JSONResponse
from starlette.templating import Jinja2Templates
from sqlalchemy import select, update, insert, delete
from dependencies import db_dependency
from DBModels.model import User, Text, AdminAction
from Schemes.admin import SchemeBlockUser, SchemeTextRequest
from Routers.user import user_is_admin_


admin_router = APIRouter()
templates = Jinja2Templates(directory='templates')


@admin_router.get(path='/getUnacceptedText',
                  response_class=JSONResponse,
                  tags=["admin"],
                  summary="Получение текстов на рассмотрение")
async def get_text(request: Request, db: db_dependency) -> JSONResponse:
    text = db.execute(select(User.login,
                             Text.text).
                        join(User, User.user_id == Text.user_id).
                        where(Text.is_accept == 0)
                      ).first()
    if text:
        return JSONResponse(content={"success": True,
                                     "user_login": text[0],
                                     "text": text[1]
                                     }, status_code=200)
    return JSONResponse(content={"success": False, 'message': 'Нет необработанных текстов'}, status_code=200)


@admin_router.patch(path='/AcceptTextRequest',
                    response_class=JSONResponse,
                    tags=["admin"],
                    summary="Одобрение текста")
async def accept_text(data: SchemeTextRequest, db: db_dependency) -> JSONResponse:
    if await user_is_admin_(data.admin_token, db):
        db.execute(update(Text).where(Text.text == data.text).values(is_accept=1))

        admin_id = db.execute(select(User.user_id).where(User.user_token == data.admin_token)).first()

        db.execute(insert(AdminAction).values({
                'action_id': 2,
                'admin_id': admin_id[0],
                'text': data.text
            })
        )

        db.commit()

        return JSONResponse(content={"success": True}, status_code=200)


@admin_router.post(path='/rejectTextRequest',
                   response_class=JSONResponse,
                   tags=["admin"],
                   summary="Отклонение текста")
async def reject_text(data: SchemeTextRequest, db: db_dependency) -> JSONResponse:
    if await user_is_admin_(data.admin_token, db):
        try:
            db.execute(delete(Text).where(Text.text == data.text))

            admin_id = db.execute(select(User.user_id).where(User.user_token == data.admin_token)).first()

            db.execute(insert(AdminAction).values({
                'action_id': 3,
                'admin_id': admin_id[0],
                'text': data.text
            }))

            db.commit()

            return JSONResponse(content={"success": True}, status_code=200)
        except:
            return JSONResponse(content={"success": False, "error_msg": "Такого текста не существует"}, status_code=200)





@admin_router.post(path='/blockUser',
                   response_class=JSONResponse,
                   tags=["admin"],
                   summary="Блокировка пользователя")
async def block_user(data: SchemeBlockUser, db: db_dependency) -> JSONResponse:
    if await user_is_admin_(data.admin_token, db):
        try:
            db.execute(update(User).where(User.login == data.user_login).values(is_blocked=1))

            admin_id = db.execute(select(User.user_id).where(User.user_token == data.admin_token)).first()

            db.execute(insert(AdminAction).values({
                'action_id': 1,
                'admin_id': admin_id,
                'user_login': data.user_login
            }))

            db.commit()

            return JSONResponse(content={"success": True})
        except:
            return JSONResponse(content={"success": False, "error_msg": "Пользователь уже заблокирован"}, status_code=200)