import logging
from typing import Tuple

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.api.dependencies.pagination_dependecie import get_pagination
from app.api.schemas import GetDevicesResponse, GetDeviceByIdResponse
from app.services.products_service import DevicesService


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/devices", summary="Получить все девайсы с пагинацией")
async def get_devices(pagination: Tuple[int, int] = Depends(get_pagination)) -> GetDevicesResponse:
    skip, limit = pagination
    logger.info(f"GET /products/devices запрос: skip={skip}, limit={limit}")
    try:
        result = await DevicesService.get_devices(skip=skip, limit=limit)
        logger.info(f"GET /products/devices успешно: {len(result.devices)} девайсов возвращено")
        return result

    except ValueError as error:
        logger.warning(f"GET /products/devices ошибка клиента: {str(error)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"GET /products/devices внутренняя ошибка: {str(error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера при получении девайса"
        )


@router.get("/devices/{id}", summary="Получить девайс по id")
async def get_devices_by_id(devices_id: int) -> GetDeviceByIdResponse:
    logger.info(f"GET /products/devices/{devices_id} запрос")
    try:
        result = await DevicesService.get_device(devices_id)
        logger.info(f"GET /products/devices/{devices_id} успешно")
        return result

    except ValueError as error:
        if "не найден" in str(error).lower():
            logger.warning(f"GET /products/devices/{devices_id} девайс не найден")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Девайс не найден"
            )

        logger.warning(f"GET /products/devices/{devices_id} ошибка клиента: {str(error)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"GET /products/devices/{devices_id} внутренняя ошибка: {str(error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера при получении девайса"
        )


@router.get("/iqos", summary="Получить все продукты iqos с пагинацией")
async def get_iqos(pagination: Tuple[int, int] = Depends(get_pagination)):
    skip, limit = pagination
    logger.info(f"GET /products/iqos запрос: skip={skip}, limit={limit}")
    try:
        result = await DevicesService.get_iqos_list(skip=skip, limit=limit)
        logger.info(f"GET /products/iqos успешно: {len(result.iqos)} iqos возвращено")
        return result

    except ValueError as error:
        logger.warning(f"GET /products/iqos ошибка клиента: {str(error)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"GET /products/iqos внутренняя ошибка: {str(error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера при получении iqos"
        )


@router.get("/iqos/{id}", summary="Получить продукт iqos по id")
async def get_iqos_by_id(iqos_id: int):
    logger.info(f"GET /products/iqos/{iqos_id} запрос")
    try:
        result = await DevicesService.get_iqos(iqos_id)
        logger.info(f"GET /products/iqos/{iqos_id} успешно")
        return result

    except ValueError as error:
        if "не найден" in str(error).lower():
            logger.warning(f"GET /products/iqos/{iqos_id} продукт iqos не найден")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Продукт iqos не найден"
            )

        logger.warning(f"GET /products/iqos/{iqos_id} ошибка клиента: {str(error)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"GET /products/iqos/{iqos_id} внутренняя ошибка: {str(error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера при получении продукта iqos"
        )


@router.get("/terea", summary="Получить все продукты terea с пагинацией")
async def get_terea(pagination: Tuple[int, int] = Depends(get_pagination)):
    skip, limit = pagination
    return {"message": "Terea"}


@router.get("/terea/{id}", summary="Получить продукт terea по id")
async def get_terea_by_id(terea_id: int):
    return {"message": "id=1 Terea"}