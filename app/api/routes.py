from fastapi import APIRouter

from app.services.scheduler_service import schedule_vm
from app.services.prediction_service import predict_load
from app.services.anomaly_service import detect_anomaly
from app.services.cluster_service import analyze_cluster
from app.services.metrics_service import generate_metrics
router = APIRouter()


@router.post("/schedule")
def schedule(data: dict):
    return schedule_vm(data)


@router.post("/predict-load")
def predict(data: dict):
    return predict_load(data)


@router.post("/detect-anomaly")
def anomaly(data: dict):
    return detect_anomaly(data)


@router.post("/cluster-analysis")
def cluster(data: dict):
    return analyze_cluster(data)

@router.get("/metrics")
def metrics():

    return generate_metrics()