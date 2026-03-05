from app.adapters.backend_adapter import normalize_nodes


def analyze_cluster(data):

    nodes = normalize_nodes(data["nodes"])

    overloaded = []

    for n in nodes:

        if n["cpu_usage"] > 85:
            overloaded.append(n["node_id"])

    status = "healthy"

    if overloaded:
        status = "degraded"

    return {

        "cluster_health": status,
        "overloaded_nodes": overloaded

    }