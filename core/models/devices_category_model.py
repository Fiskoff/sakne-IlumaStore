from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import VARCHAR

from core.models.base_model import BaseModel


class DevicesCategoryModel(BaseModel):
    __tablename__ = "Devices_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(VARCHAR(256))

    devices: Mapped[list["Devices"]] = relationship(back_populates="category")