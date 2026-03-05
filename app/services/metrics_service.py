import random

from app.models.predictor_model import LoadPredictor

predictor = LoadPredictor()

def generate_metrics():

    vms = []

    for i in range(3):

        cpu = random.randint(10, 95)
        ram = random.randint(10, 80)
        net = random.randint(10, 200)

        prediction = predictor.predict([cpu, cpu-5, cpu-10])

        status = "stable"

        if cpu > 80:
            status = "high-load"

        vms.append({

            "vm_id": f"vm-{i+1}",
            "cpu": cpu,
            "ram": ram,
            "network": net,
            "prediction": prediction,
            "status": status

        })

    return vms