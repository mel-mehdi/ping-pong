class AIPrediction:
    def predict(self, ball, cpu_x, screen_height):
        x = ball.x
        y = ball.y
        vx = ball.vx
        vy = ball.vy
        if vx >= 0:
            return y 
        while x > cpu_x:
            x += vx
            y += vy

            if y - ball.radius <= 0 or y + ball.radius >= screen_height:
                vy *= -1

        return y
