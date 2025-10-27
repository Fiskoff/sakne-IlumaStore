from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from core.models.base_model import BaseModel


class DevicesCategoryModel(BaseModel):
    __tablename__ = "Devices_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(String(256))