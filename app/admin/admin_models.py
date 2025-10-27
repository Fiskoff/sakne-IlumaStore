from sqladmin import ModelView

from core.models.terea_model import TereaModel


class TereaAdmin(ModelView, model=TereaModel):
    name = "Terea"
    name_plural = "Таблица Terea"
    column_list = [columns.name for columns in TereaModel.__table__.columns]


