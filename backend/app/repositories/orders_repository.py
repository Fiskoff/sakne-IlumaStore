import logging
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.core.models import OrderModel, OrderedProductModel
from backend.core.db_helper import db_helper

logger = logging.getLogger(__name__)


class OrderRepository:

    @staticmethod
    async def create(order_data: dict) -> OrderModel:
        logger.info(f"Создание нового заказа с данными: {order_data}")
        try:
            ordered_items_data = order_data.pop('ordered_items', [])

            total_amount = Decimal('0.00')
            for item_data in ordered_items_data:
                quantity = item_data.get('quantity', 0)
                price = Decimal(item_data.get('price_at_time_of_order', 0))
                total_amount += Decimal(quantity) * price

            order_data['total_amount'] = total_amount

            new_order = OrderModel(**order_data)

            async with db_helper.session_factory() as session:
                session.add(new_order)
                await session.flush()

                for item_data in ordered_items_data:
                    item_data['price_at_time_of_order'] = Decimal(item_data['price_at_time_of_order'])
                    item = OrderedProductModel(order_id=new_order.id, **item_data)
                    session.add(item)

                await session.commit()

                await session.refresh(new_order)

                result = await session.execute(
                    select(OrderModel)
                    .options(selectinload(OrderModel.ordered_items))
                    .where(OrderModel.id == new_order.id)
                )
                fully_loaded_order = result.unique().scalar_one()

                logger.info(f"Заказ успешно создан с ID: {fully_loaded_order.id}")
                return fully_loaded_order
        except Exception as error:
            logger.error(f"Ошибка при создании заказа: {str(error)}", exc_info=True)
            raise