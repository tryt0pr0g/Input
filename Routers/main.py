from fastapi import APIRouter
from Routers.handlers import router_page
from Routers.admin import admin_router
from Routers.user import user_router


router = APIRouter()


router.include_router(router_page)
router.include_router(user_router, prefix='/users')
router.include_router(admin_router, prefix='/admins')