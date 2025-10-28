import logging

from app.api.schemas import GetDevicesResponse, DevicesSchema, GetDeviceByIdResponse
from app.repositories.products_repositorie import DevicesRepository


logger = logging.getLogger(__name__)


class DevicesService:
    @staticmethod
    async def get_devices(skip: int = 0, limit: int = 100) -> GetDevicesResponse:
        logger.info(f"Получение списка девайсов: skip={skip}, limit={limit}")
        try:
            devices_models, total = await DevicesRepository.select_devices(skip=skip, limit=limit)

            devices_response = [
                DevicesSchema(
                    id=device.id,
                    name=device.name,
                    description=device.description,
                    image=device.image,
                    price=device.price,
                    nalichie=device.nalichie,
                    new=device.new,
                    hit=device.hit,
                    color=device.color,
                    ref=device.ref,
                    type=device.type,
                    device_id=device.device_id,
                    category=device.category
                ) for device in devices_models

            ]

            logger.info(f"Успешно возвращено {len(devices_response)} девайсов")
            return GetDevicesResponse(
                devices=devices_response,
                skip=skip,
                limit=limit,
                total=total
            )

        except Exception as error:
            logger.error(f"Ошибка при получении девайсов: {str(error)}", exc_info=True)
            raise ValueError(f"Ошибка при получении девайсов: {str(error)}")

    @staticmethod
    async def get_device(devices_id: int) -> GetDevicesResponse:
        logger.info(f"Получение девайса по id: {devices_id}")
        try:
            device_model = await DevicesRepository.select_device_by_id(devices_id)

            if not device_model:
                logger.warning(f"Девайс с id {devices_id} не найден")
                raise ValueError("Девайс не найден")

            device_response = DevicesSchema(
                id=device_model.id,
                name=device_model.name,
                description=device_model.description,
                image=device_model.image,
                price=device_model.price,
                nalichie=device_model.nalichie,
                new=device_model.new,
                hit=device_model.hit,
                color=device_model.color,
                ref=device_model.ref,
                type=device_model.type,
                device_id=device_model.device_id,
                category=device_model.category
            )

            logger.info(f"Девайса с id {devices_id} успешно получен")
            return GetDeviceByIdResponse(device=device_response)

        except ValueError as error:
            logger.warning(f"Девайс с id {devices_id} не найден")
            raise ValueError(str(error))
        except Exception as error:
            logger.error(f"Ошибка при получении девайса {devices_id}: {str(error)}", exc_info=True)
            raise ValueError(f"Ошибка при получении девайса: {str(error)}")
