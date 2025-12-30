import pygame

class Paddle:
    def __init__(self, x, y, height, screen_height, speed=7):
        self.x = x
        self.y = y
        self.height = height
        self.width = 15
        self.screen_height = screen_height
        self.speed = speed

    def move(self, direction):
        self.y += direction * self.speed

        if self.y < 0:
            self.y = 0
        if self.y + self.height > self.screen_height:
            self.y = self.screen_height - self.height
    def draw(self, screen):
        pygame.draw.rect(screen, "white", (self.x, self.y, self.width, self.height))
