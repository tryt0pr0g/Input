from pydantic import BaseModel, Field


class SchemeTextRequest(BaseModel):
    admin_token: str = Field(min_length=32)
    text: str


class SchemeBlockUser(BaseModel):
    admin_token: str = Field(min_length=32)
    user_login: str
