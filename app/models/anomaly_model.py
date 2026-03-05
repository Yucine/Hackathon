import numpy as np
from sklearn.ensemble import IsolationForest


class AnomalyDetector:

    def __init__(self):

        self.model = IsolationForest(
            contamination=0.02,
            random_state=42
        )

    def detect(self, metrics):

        X = np.array(metrics).reshape(1, -1)

        result = self.model.fit_predict(X)

        return result[0] == -1