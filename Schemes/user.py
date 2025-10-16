from pydantic import BaseModel, Field


class SchemeTextSend(BaseModel):
    text: str = Field(min_length=15)
    user_token: str = Field(min_length=32)


class SchemeAuthUser(BaseModel):
    login: str
    password: str


class SchemeUser(BaseModel):
    user_token: str = Field(min_length=32)
