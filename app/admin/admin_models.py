from sqladmin import ModelView

from core.models import (
    DevicesCategoryModel,
    IqosModel, IqosCategoryModel,
    TereaModel, TereaCategoryModel
)


class IqosAdmin(ModelView, model=IqosModel):
    name = "Iqos"
    name_plural = "Таблица Iqos"
    column_list = [columns.name for columns in IqosModel.__table__.columns] + [IqosModel.category]


class TereaAdmin(ModelView, model=TereaModel):
    name = "Terea"
    name_plural = "Таблица Terea"
    column_list = [columns.name for columns in TereaModel.__table__.columns] + [TereaModel.category]


class DevicesCategoryAdmin(ModelView, model=DevicesCategoryModel):
    name = "Категории Devices"
    name_plural = "Таблица категорий Devices"
    column_list = [DevicesCategoryModel.id, DevicesCategoryModel.category_name]


class IqosCategoryAdmin(ModelView, model=IqosCategoryModel):
    name = "Категории Iqos"
    name_plural = "Таблица категорий Iqos"
    column_list = [IqosCategoryModel.id, IqosCategoryModel.category_name]


class TereaCategoryAdmin(ModelView, model=TereaCategoryModel):
    name = "Категории Terea"
    name_plural = "Таблица категорий Terea"
    column_list = [TereaCategoryModel.id, TereaCategoryModel.category_name]