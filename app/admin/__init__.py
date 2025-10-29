from app.admin.admin_models import (
    IqosAdmin,
    TereaAdmin,
    DevicesCategoryAdmin,
    IqosCategoryAdmin,
    TereaCategoryAdmin
)
from app.admin.devices_admin_model import DevicesAdmin

admin_views = [
    DevicesAdmin,
    IqosAdmin,
    TereaAdmin,
    DevicesCategoryAdmin,
    IqosCategoryAdmin,
    TereaCategoryAdmin
]