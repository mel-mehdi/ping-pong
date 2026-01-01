import random
import math

class PongEngine:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.paddle_width = 10
        self.paddle_height = 100
        self.ball_size = 10
        self.ball_speed = 5
        self.paddle_speed = 7
        
        # Game State
        self.player1_y = self.height / 2 - self.paddle_height / 2
        self.player2_y = self.height / 2 - self.paddle_height / 2
        self.ball_x = self.width / 2 - self.ball_size / 2
        self.ball_y = self.height / 2 - self.ball_size / 2
        self.ball_dx = self.ball_speed * (1 if random.random() > 0.5 else -1)
        self.ball_dy = self.ball_speed * (random.random() * 2 - 1)
        
        self.score1 = 0
        self.score2 = 0
        self.game_over = False
        self.winner = None

        # Input State
        self.p1_up = False
        self.p1_down = False
        self.p2_up = False
        self.p2_down = False

    def update(self):
        if self.game_over:
            return

        # Update Paddles
        if self.p1_up and self.player1_y > 0:
            self.player1_y -= self.paddle_speed
        if self.p1_down and self.player1_y < self.height - self.paddle_height:
            self.player1_y += self.paddle_speed
            
        if self.p2_up and self.player2_y > 0:
            self.player2_y -= self.paddle_speed
        if self.p2_down and self.player2_y < self.height - self.paddle_height:
            self.player2_y += self.paddle_speed

        # Update Ball
        self.ball_x += self.ball_dx
        self.ball_y += self.ball_dy

        # Wall Collisions (Top/Bottom)
        if self.ball_y <= 0 or self.ball_y + self.ball_size >= self.height:
            self.ball_dy *= -1

        # Paddle Collisions
        # Player 1 (Left)
        if (self.ball_x <= 20 + self.paddle_width and 
            self.ball_x + self.ball_size >= 20 and
            self.ball_y + self.ball_size >= self.player1_y and 
            self.ball_y <= self.player1_y + self.paddle_height):
            
            self.ball_dx = abs(self.ball_dx) * 1.1 # Speed up slightly
            # Add some angle based on where it hit the paddle
            center_paddle = self.player1_y + self.paddle_height / 2
            center_ball = self.ball_y + self.ball_size / 2
            self.ball_dy += (center_ball - center_paddle) * 0.05

        # Player 2 (Right)
        if (self.ball_x + self.ball_size >= self.width - 20 - self.paddle_width and 
            self.ball_x <= self.width - 20 and
            self.ball_y + self.ball_size >= self.player2_y and 
            self.ball_y <= self.player2_y + self.paddle_height):
            
            self.ball_dx = -abs(self.ball_dx) * 1.1
            center_paddle = self.player2_y + self.paddle_height / 2
            center_ball = self.ball_y + self.ball_size / 2
            self.ball_dy += (center_ball - center_paddle) * 0.05

        # Scoring
        if self.ball_x < 0:
            self.score2 += 1
            print(f"Score Update: P1={self.score1} P2={self.score2}")
            self.reset_ball()
        elif self.ball_x > self.width:
            self.score1 += 1
            print(f"Score Update: P1={self.score1} P2={self.score2}")
            self.reset_ball()

        # Win Condition
        if self.score1 >= 5:
            self.game_over = True
            self.winner = 1
            print(f"Game Over: Winner is P1")
        elif self.score2 >= 5:
            self.game_over = True
            self.winner = 2
            print(f"Game Over: Winner is P2")

    def reset_ball(self):
        self.ball_x = self.width / 2 - self.ball_size / 2
        self.ball_y = self.height / 2 - self.ball_size / 2
        self.ball_dx = self.ball_speed * (1 if random.random() > 0.5 else -1)
        self.ball_dy = self.ball_speed * (random.random() * 2 - 1)
        # Reset speed
        self.ball_dx = self.ball_speed * (1 if self.ball_dx > 0 else -1)

    def set_input(self, player_id, up, down):
        if player_id == 1:
            self.p1_up = up
            self.p1_down = down
        elif player_id == 2:
            self.p2_up = up
            self.p2_down = down

    def get_state(self):
        return {
            'p1_y': self.player1_y,
            'p2_y': self.player2_y,
            'bx': self.ball_x,
            'by': self.ball_y,
            's1': self.score1,
            's2': self.score2,
            'over': self.game_over,
            'winner': self.winner
        }
