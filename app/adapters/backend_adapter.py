def normalize_nodes(nodes):

    normalized = []

    for n in nodes:

        cpu = n.get("cpu", 0)
        ram = n.get("ram", 0)

        normalized.append({

            "node_id": n.get("id"),

            "cpu_usage": cpu,
            "ram_usage": ram,

            "cpu_free": max(0, 100 - cpu),
            "ram_free": max(0, 100 - ram),

            "network_usage": n.get("network", 0)

        })

    return normalized