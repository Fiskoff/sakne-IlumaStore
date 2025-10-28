from typing import Tuple

from fastapi import APIRouter, Depends

from app.api.dependencies.pagination_dependecie import get_pagination
from app.api.schemas import GetDevicesResponse, GetDeviceByIdResponse


router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/devices", summary="Получить все девайсы с пагинацией")
async def get_devices(pagination: Tuple[int, int] = Depends(get_pagination)) -> GetDevicesResponse:
    skip, limit = pagination
    return {"message": "Devices"}


@router.get("/devices/{id}", summary="Получить девайс по id")
async def get_devices_by_id(devices_id: int) -> GetDeviceByIdResponse:
    return {"message": "id=1 Devices"}


@router.get("/iqos", summary="Получить все продукты iqos с пагинацией")
async def get_iqos(pagination: Tuple[int, int] = Depends(get_pagination)):
    skip, limit = pagination
    return {"message": "Iqos"}


@router.get("/iqos/{id}", summary="Получить продукт iqos по id")
async def get_iqos_by_id(iqos_id: int):
    return {"message": "id=1 Iqos"}


@router.get("/terea", summary="Получить все продукты terea с пагинацией")
async def get_terea(pagination: Tuple[int, int] = Depends(get_pagination)):
    skip, limit = pagination
    return {"message": "Terea"}


@router.get("/terea/{id}", summary="Получить продукт terea по id")
async def get_terea_by_id(terea_id: int):
    return {"message": "id=1 Terea"}