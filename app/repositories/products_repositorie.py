import logging
from typing import Tuple, List

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.models import DevicesModel
from core.db_helper import db_helper


logger = logging.getLogger(__name__)


class DevicesRepository:
    @staticmethod
    async def select_devices(skip: int = 0, limit: int = 100) -> Tuple[List[DevicesModel], int]:
        logger.debug(f"Получение всех девайсов с пагинацией: skip={skip}, limit={limit}")
        try:
            async with db_helper.session_factory() as session:
                total_query = select(func.count(DevicesModel.id))
                total_result = await session.execute(total_query)
                total = total_result.scalar()

                devices_query = (
                    select(DevicesModel)
                    .options(selectinload(DevicesModel.category))
                    .offset(skip)
                    .limit(limit)
                    .order_by(DevicesModel.id.desc())
                )
                devices_result = await session.execute(devices_query)
                devices = devices_result.scalars().all()

                logger.info(f"Получено {len(devices)} девайсов из {total} всего")
                return devices, total
        except Exception as error:
            logger.error(f"Ошибка при получении списка девайсов: {str(error)}", exc_info=True)
            raise

    @staticmethod
    async def select_device_by_id(devices_id: int) -> DevicesModel | None:
        logger.debug(f"Поиск девайса по id: {devices_id}")
        try:
            async with db_helper.session_factory() as session:
                result = await session.execute(
                    select(DevicesModel)
                    .options(selectinload(DevicesModel.category))
                    .where(DevicesModel.id == devices_id)
                )
                task = result.scalar_one_or_none()

                if task:
                    logger.debug(f"Дeвайс с id {devices_id} найден")
                else:
                    logger.debug(f"Дeвайс с id {devices_id} не найден")

                return task
        except Exception as error:
            logger.error(f"Ошибка при получении девайса по id {devices_id}: {str(error)}", exc_info=True)
            raise