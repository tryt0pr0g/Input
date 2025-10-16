from fastapi import APIRouter, Request
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates


router_page = APIRouter()
templates = Jinja2Templates(directory='templates')


@router_page.get(path='/',
                 response_class=HTMLResponse,
                 tags=["Навигация"],
                 summary="Получение главной страницы")
async def main_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse('index.html', {"request": request}, status_code=302)


@router_page.get(path='/{variable}',
                 response_class=HTMLResponse,
                 tags=["Навигация"],
                 summary="Получение других страниц")
async def link_url(request: Request, variable: str) -> HTMLResponse:
    allowed_templates = {
        "addText": "addText",
        "adminPanel": "adminPanel",
        "authorization": "auth_page",
        "game": "levels",
        "registration": "registration"
    }

    if variable in allowed_templates:
        return templates.TemplateResponse(f"{allowed_templates[variable]}.html", {"request": request}, status_code=302)

    return templates.TemplateResponse(f"eblan.html", {"request": request}, status_code=303)