import docker
from app.models.predictor_model import LoadPredictor

client = docker.from_env()
predictor = LoadPredictor()


def get_container_metrics():

    containers = client.containers.list()

    results = []

    for c in containers:

        stats = c.stats(stream=False)

        cpu_usage = stats["cpu_stats"]["cpu_usage"]["total_usage"]
        system_cpu = stats["cpu_stats"]["system_cpu_usage"]

        cpu_percent = 0

        if system_cpu > 0:
            cpu_percent = (cpu_usage / system_cpu) * 100

        memory = stats["memory_stats"]["usage"]

        ram_percent = memory / stats["memory_stats"]["limit"] * 100

        prediction = predictor.predict([
            cpu_percent,
            cpu_percent * 0.9,
            cpu_percent * 0.8
        ])

        status = "stable"

        if cpu_percent > 80:
            status = "high-load"

        results.append({

            "vm_id": c.name,
            "cpu": round(cpu_percent,2),
            "ram": round(ram_percent,2),
            "network": 0,
            "prediction": prediction,
            "status": status

        })

    return results