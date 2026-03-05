from app.models.predictor_model import LoadPredictor

model = LoadPredictor()


def predict_load(data):

    history = data["cpu_history"]

    prediction = model.predict(history)

    action = "stable"

    if prediction > 80:
        action = "scale_up"

    if prediction < 20:
        action = "scale_down"

    return {

        "predicted_cpu": prediction,
        "recommendation": action

    }