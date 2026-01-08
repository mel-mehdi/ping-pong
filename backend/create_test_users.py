#!/usr/bin/env python
"""
Script to create test users for search functionality testing
Usage: 
  python create_test_users.py              # Create default 10 users
  python create_test_users.py 20           # Create 20 users
  python create_test_users.py 50 mypass    # Create 50 users with custom password
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from user_management.models import User

# Extended test users data
test_users_pool = [
    {"username": "alice_smith", "email": "alice.smith@test.com", "fullname": "Alice Smith"},
    {"username": "bob_jones", "email": "bob.jones@test.com", "fullname": "Bob Jones"},
    {"username": "charlie_brown", "email": "charlie.brown@test.com", "fullname": "Charlie Brown"},
    {"username": "diana_prince", "email": "diana.prince@test.com", "fullname": "Diana Prince"},
    {"username": "edward_stark", "email": "edward.stark@test.com", "fullname": "Edward Stark"},
    {"username": "fiona_green", "email": "fiona.green@test.com", "fullname": "Fiona Green"},
    {"username": "george_martin", "email": "george.martin@test.com", "fullname": "George Martin"},
    {"username": "hannah_white", "email": "hannah.white@test.com", "fullname": "Hannah White"},
    {"username": "ian_black", "email": "ian.black@test.com", "fullname": "Ian Black"},
    {"username": "julia_moore", "email": "julia.moore@test.com", "fullname": "Julia Moore"},
]

# Generate more users if needed
first_names = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ian", "Julia",
               "Kevin", "Laura", "Mike", "Nina", "Oscar", "Paula", "Quinn", "Rachel", "Steve", "Tina",
               "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack", "Amy", "Brian", "Cara", "David"]

last_names = ["Smith", "Jones", "Brown", "Prince", "Stark", "Green", "Martin", "White", "Black", "Moore",
              "Taylor", "Anderson", "Thomas", "Jackson", "Harris", "Clark", "Lewis", "Walker", "Hall", "Allen"]

def generate_test_users(count):
    """Generate test user data"""
    users = []
    
    # First use predefined users
    for i, user_data in enumerate(test_users_pool):
        if i >= count:
            break
        users.append(user_data)
    
    # Generate additional users if needed
    for i in range(len(test_users_pool), count):
        first_name = first_names[i % len(first_names)]
        last_name = last_names[(i // len(first_names)) % len(last_names)]
        username = f"{first_name.lower()}_{last_name.lower()}_{i+1}"
        
        users.append({
            "username": username,
            "email": f"{username}@test.com",
            "fullname": f"{first_name} {last_name}"
        })
    
    return users

def create_test_users(count=10, password='testpass123'):
    """Create test users if they don't exist"""
    created_count = 0
    existing_count = 0
    
    test_users = generate_test_users(count)
    
    for user_data in test_users:
        username = user_data['username']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"✓ User '{username}' already exists")
            existing_count += 1
            continue
        
        try:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=user_data['email'],
                password=password,
                fullname=user_data.get('fullname', '')
            )
            print(f"✓ Created user: {username} ({user.email})")
            created_count += 1
        except Exception as e:
            print(f"✗ Error creating user '{username}': {str(e)}")
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Created: {created_count} users")
    print(f"  Already existed: {existing_count} users")
    print(f"  Total test users: {created_count + existing_count}")
    print(f"{'='*50}")
    print(f"\nPassword for all users: {password}")

if __name__ == '__main__':
    # Parse command line arguments
    num_users = 10
    password = 'testpass123'
    
    if len(sys.argv) > 1:
        try:
            num_users = int(sys.argv[1])
        except ValueError:
            print(f"Error: Invalid number of users '{sys.argv[1]}'")
            sys.exit(1)
    
    if len(sys.argv) > 2:
        password = sys.argv[2]
    
    print(f"Creating {num_users} test users...\n")
    create_test_users(num_users, password)
