from app.models.security_model import SecurityModel

security_model = SecurityModel()

def analyze_security(data):

    result = security_model.analyze(data)

    if result.get("alert"):

        if data["request_rate"] > 200:
            result["attack_type"] = "possible_ddos"

        if data["failed_logins"] > 20:
            result["attack_type"] = "bruteforce"

    return result