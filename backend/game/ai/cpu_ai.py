from .ai_predect import AIPrediction
from .ai_error import AIError
from .ai_reaction import AIReaction
from .difficulty import Difficulty

class CpuAI:
    def __init__(self, level="MEDIUM"):
        level = level.upper()
        if level not in ["EASY", "MEDIUM", "HARD"]:
            level = "MEDIUM"
        self.speed = getattr(Difficulty, level)["speed"]
        self.error_amount = getattr(Difficulty, level)["error"]
        self.reaction_value = getattr(Difficulty, level)["reaction"]
        self.prediction_strength = getattr(Difficulty, level)["prediction"]
        self.predictor = AIPrediction()
        self.error_model = AIError()
        self.reactor = AIReaction()

    def decide_direction(self, cpu_paddle, ball):
        if not self.reactor.should_react(self.reaction_value):
            return 0
        target_y = self.predictor.predict(ball, cpu_paddle.x, ball.screen_height)
        paddle_center = cpu_paddle.y + cpu_paddle.height / 2
        target_y = paddle_center + (target_y - paddle_center) * self.prediction_strength

        target_y = self.error_model.apply_error(target_y, self.error_amount)
        paddle_center = cpu_paddle.y + cpu_paddle.height / 2
        if paddle_center < target_y:
            return 1  
        elif paddle_center > target_y:
            return -1  
        else:
            return 0
