from app.models.scheduler_model import Scheduler
from app.adapters.backend_adapter import normalize_nodes

scheduler = Scheduler()


def schedule_vm(data):

    nodes = normalize_nodes(data["nodes"])

    node = scheduler.select(nodes)

    return {

        "selected_node": node["node_id"],
        "reason": "lowest weighted load"

    }