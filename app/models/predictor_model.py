import numpy as np


class LoadPredictor:

    def predict(self, history):

        history = np.array(history)

        trend = np.mean(history[-3:])

        predicted = trend * 1.15

        return min(float(predicted), 100)