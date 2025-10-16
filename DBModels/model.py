from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import ModelORM


class Text(ModelORM):
    __tablename__ = 'texts'

    text_id = Column(Integer, primary_key=True, unique=True)
    text = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), default=1)
    is_accept = Column(Integer, default=0)

    user = relationship('User', back_populates='texts')


class User(ModelORM):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, unique=True)
    login = Column(String, unique=True)
    password = Column(String)
    user_token = Column(String)
    is_blocked = Column(Integer, default=0)
    is_admin = Column(Integer, default=0)

    texts = relationship('Text', back_populates='user')
    admin_actions = relationship('AdminAction', back_populates='admin')


class Action(ModelORM):
    __tablename__ = 'actions'

    action_id  = Column(Integer, primary_key=True, unique=True)
    title = Column(String, unique=True, nullable=False)

    admin_actions = relationship('AdminAction', back_populates='action')


class AdminAction(ModelORM):
    __tablename__ = 'admin_actions'

    admin_action_id = Column(Integer, primary_key=True, unique=True)
    action_id = Column(Integer, ForeignKey('actions.action_id'), nullable=False)
    admin_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    text = Column(String)
    user_login = Column(String)

    admin = relationship("User", back_populates="admin_actions")
    action = relationship("Action", back_populates="admin_actions")