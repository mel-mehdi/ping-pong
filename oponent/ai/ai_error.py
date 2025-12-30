import random

class AIError:
    def apply_error(self, y, error_amount):
        return y + random.randint(-error_amount, error_amount)
