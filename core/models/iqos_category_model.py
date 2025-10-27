from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from core.models.base_model import BaseModel


class IqosCategoryModel(BaseModel):
    __tablename__ = "Iqos_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(String(256))