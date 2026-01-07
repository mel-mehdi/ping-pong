import random

class AIReaction:
    def should_react(self, reaction_value):
        return random.random() < reaction_value
