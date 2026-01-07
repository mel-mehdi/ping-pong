class Ball:
    def __init__(self, x, y, vx, vy, screen_width, screen_height):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.radius = 10
        self.screen_width = screen_width
        self.screen_height = screen_height

    def update(self):
        self.x += self.vx
        self.y += self.vy
        if self.y - self.radius <= 0 or self.y + self.radius >= self.screen_height:
            self.vy *= -1

    def collide_with_paddle(self, paddle):
        if (
            self.x - self.radius < paddle.x + paddle.width
            and self.x + self.radius > paddle.x
            and self.y + self.radius > paddle.y
            and self.y - self.radius < paddle.y + paddle.height
            ):
            self.vx *= -1.05
