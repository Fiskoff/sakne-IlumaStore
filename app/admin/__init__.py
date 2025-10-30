from app.admin.devices_admin_model import DevicesAdmin
from app.admin.iqos_admin_model import IqosAdmin
from app.admin.terea_admin_model import TereaAdmin
from app.admin.category_admin_madel import DevicesCategoryAdmin, IqosCategoryAdmin, TereaCategoryAdmin


admin_views = [
    DevicesAdmin,
    IqosAdmin,
    TereaAdmin,
    DevicesCategoryAdmin,
    IqosCategoryAdmin,
    TereaCategoryAdmin
]