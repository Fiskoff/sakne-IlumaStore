from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String

from core.models.base_model import BaseModel


class TereaCategoryModel(BaseModel):
    __tablename__ = "Terea_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(String(256))

    terea: Mapped["TereaModel"] = relationship(back_populates="category")
