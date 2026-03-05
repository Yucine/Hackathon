from app.models.anomaly_model import AnomalyDetector

detector = AnomalyDetector()


def detect_anomaly(data):

    metrics = data["metrics"]

    result = detector.detect(metrics)

    return {

        "anomaly_detected": result

    }