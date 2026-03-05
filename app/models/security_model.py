import numpy as np
from sklearn.ensemble import IsolationForest

class SecurityModel:

    def __init__(self):

        self.model = IsolationForest(
            contamination=0.05,
            random_state=42
        )

        self.history = []

    def analyze(self, metrics):

        vector = [
            metrics["request_rate"],
            metrics["unique_ips"],
            metrics["failed_logins"],
            metrics["cpu_load"]
        ]

        self.history.append(vector)

        if len(self.history) < 20:
            return {"status": "learning"}

        X = np.array(self.history[-100:])

        self.model.fit(X)

        result = self.model.predict([vector])[0]

        if result == -1:
            return {
                "alert": True,
                "type": "anomaly",
                "message": "Suspicious traffic detected"
            }

        return {"alert": False}