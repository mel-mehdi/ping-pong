#!/usr/bin/env python
"""
Script to create test users for search functionality testing
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from user_management.models import User

# Test users data
test_users = [
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

def create_test_users():
    """Create test users if they don't exist"""
    created_count = 0
    existing_count = 0
    
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
                password='testpass123',  # Same password for all test users
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
    print(f"\nTest password for all users: testpass123")

if __name__ == '__main__':
    print("Creating test users for search functionality...\n")
    create_test_users()
