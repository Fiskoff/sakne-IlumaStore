from sqladmin import ModelView

from core.models.terea_model import TereaModel
from core.models.iqos_model import IqosModel
from core.models.devices_model import DevicesModel


class TereaAdmin(ModelView, model=TereaModel):
    name = "Terea"
    name_plural = "Таблица Terea"
    column_list = [columns.name for columns in TereaModel.__table__.columns]


class IqosAdmin(ModelView, model=IqosModel):
    name = "Iqos"
    name_plural = "Таблица Iqos"
    column_list = [columns.name for columns in IqosModel.__table__.columns]


class DevicesAdmin(ModelView, model=DevicesModel):
    name = "Devices"
    name_plural = "Таблица Devices"
    column_list = [columns.name for columns in DevicesModel.__table__.columns]
