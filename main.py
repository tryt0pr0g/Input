from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response

from database import engine
from DBModels import model

import uvicorn

app = FastAPI()
model.ModelORM.metadata.create_all(bind=engine)





app.mount('/static', StaticFiles(directory='static', html=True), name='static')


from Routers.main import router
app.include_router(router)


if __name__ == '__main__':
    uvicorn.run(app, port=8000)


# def create_app() -> FastAPI:
#     app = FastAPI()
#
#     model.ModelORM.metadata.create_all(bind=engine)
#
#     @app.get("/favicon.ico")
#     async def favicon():
#         return Response(status_code=204)
#
#     app.mount('/static', StaticFiles(directory='static', html=True), name='static')
#
#     from Routers.main import router
#     app.include_router(router)
#
#     return app