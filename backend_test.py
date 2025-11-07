#!/usr/bin/env python3
"""
Backend API Testing for FlowSpace Card Operations and Activity Logging
Tests card CRUD operations and verifies activity logging functionality
"""

import requests
import json
import jwt
import os
import time
from datetime import datetime, timedelta
from typing import Dict, Optional

# Configuration
BACKEND_URL = "http://localhost:8001"
JWT_SECRET = os.environ.get('JWT_ACCESS_SECRET', 'emergent_flowspace_access_secret_')

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class FlowSpaceBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        self.user_id = None
        self.board_id = None
        self.column_id = None
        self.card_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if passed else f"{Colors.RED}✗ FAIL{Colors.RESET}"
        print(f"{status} - {test_name}")
        if message:
            print(f"  {message}")
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
        
    def generate_jwt_token(self, user_id: str) -> str:
        """Generate JWT token for authentication"""
        payload = {
            'sub': user_id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    def setup_test_data(self):
        """Create test user and board"""
        print(f"\n{Colors.BOLD}Setting up test data...{Colors.RESET}")
        
        # Create test user directly in MongoDB
        try:
            from pymongo import MongoClient
            client = MongoClient('mongodb://localhost:27017/flowspace')
            db = client['flowspace']
            
            # Create or get test user
            test_user = db.users.find_one({'email': 'test@flowspace.com'})
            if not test_user:
                user_data = {
                    'name': 'Test User',
                    'email': 'test@flowspace.com',
                    'password': 'test123',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
                result = db.users.insert_one(user_data)
                self.user_id = str(result.inserted_id)
                print(f"  Created test user: {self.user_id}")
            else:
                self.user_id = str(test_user['_id'])
                print(f"  Using existing test user: {self.user_id}")
            
            # Generate JWT token
            self.token = self.generate_jwt_token(self.user_id)
            print(f"  Generated JWT token")
            
            # Create test board with columns
            board_data = {
                'title': 'Test Board for Card Operations',
                'description': 'Testing card CRUD and activity logging',
                'ownerId': test_user['_id'] if test_user else result.inserted_id,
                'members': [],
                'columns': [
                    {'title': 'To Do', 'order': 0},
                    {'title': 'In Progress', 'order': 1},
                    {'title': 'Done', 'order': 2}
                ],
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            board_result = db.boards.insert_one(board_data)
            self.board_id = str(board_result.inserted_id)
            
            # Get column ID
            board = db.boards.find_one({'_id': board_result.inserted_id})
            self.column_id = str(board['columns'][0]['_id'])
            
            print(f"  Created test board: {self.board_id}")
            print(f"  Column ID: {self.column_id}")
            
            return True
            
        except Exception as e:
            print(f"{Colors.RED}Failed to setup test data: {str(e)}{Colors.RESET}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print(f"\n{Colors.BOLD}Cleaning up test data...{Colors.RESET}")
        try:
            from pymongo import MongoClient
            client = MongoClient('mongodb://localhost:27017/flowspace')
            db = client['flowspace']
            
            # Delete test cards
            if self.board_id:
                from bson import ObjectId
                db.cards.delete_many({'boardId': ObjectId(self.board_id)})
                print(f"  Deleted test cards")
                
                # Delete test board
                db.boards.delete_one({'_id': ObjectId(self.board_id)})
                print(f"  Deleted test board")
            
            # Delete test activities
            if self.user_id:
                from bson import ObjectId
                db.activities.delete_many({'userId': ObjectId(self.user_id)})
                print(f"  Deleted test activities")
            
        except Exception as e:
            print(f"{Colors.YELLOW}Warning: Cleanup failed: {str(e)}{Colors.RESET}")
    
    def test_card_creation(self):
        """Test POST /api/cards/:boardId/cards"""
        print(f"\n{Colors.BOLD}Test 1: Card Creation{Colors.RESET}")
        
        url = f"{self.base_url}/api/cards/{self.board_id}/cards"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        card_data = {
            'columnId': self.column_id,
            'title': 'Test Card - Backend Testing',
            'description': 'This card is created by automated backend tests',
            'tags': ['test', 'automation'],
            'dueDate': (datetime.utcnow() + timedelta(days=7)).isoformat()
        }
        
        try:
            response = requests.post(url, json=card_data, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                if 'card' in data:
                    self.card_id = data['card']['_id']
                    self.log_test(
                        "Card Creation API",
                        True,
                        f"Card created successfully with ID: {self.card_id}"
                    )
                    
                    # Verify card fields
                    card = data['card']
                    fields_ok = (
                        card['title'] == card_data['title'] and
                        card['description'] == card_data['description'] and
                        card['columnId'] == self.column_id and
                        card['boardId'] == self.board_id
                    )
                    self.log_test(
                        "Card Fields Validation",
                        fields_ok,
                        "All card fields match expected values" if fields_ok else "Card fields mismatch"
                    )
                    
                    return True
                else:
                    self.log_test("Card Creation API", False, "Response missing 'card' field")
                    return False
            else:
                self.log_test(
                    "Card Creation API",
                    False,
                    f"Expected status 201, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Card Creation API", False, f"Exception: {str(e)}")
            return False
    
    def test_card_retrieval(self):
        """Test GET /api/cards/:boardId/cards"""
        print(f"\n{Colors.BOLD}Test 2: Card Retrieval{Colors.RESET}")
        
        url = f"{self.base_url}/api/cards/{self.board_id}/cards"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'cards' in data:
                    cards = data['cards']
                    card_found = any(c['_id'] == self.card_id for c in cards)
                    
                    self.log_test(
                        "Card Retrieval API",
                        card_found,
                        f"Retrieved {len(cards)} cards, test card found" if card_found else "Test card not found in response"
                    )
                    return card_found
                else:
                    self.log_test("Card Retrieval API", False, "Response missing 'cards' field")
                    return False
            else:
                self.log_test(
                    "Card Retrieval API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Card Retrieval API", False, f"Exception: {str(e)}")
            return False
    
    def test_card_update(self):
        """Test PUT /api/cards/:id"""
        print(f"\n{Colors.BOLD}Test 3: Card Update{Colors.RESET}")
        
        if not self.card_id:
            self.log_test("Card Update API", False, "No card ID available for update test")
            return False
        
        url = f"{self.base_url}/api/cards/{self.card_id}"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        update_data = {
            'title': 'Updated Test Card - Backend Testing',
            'description': 'This card has been updated by automated tests',
            'tags': ['test', 'automation', 'updated']
        }
        
        try:
            response = requests.put(url, json=update_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'card' in data:
                    card = data['card']
                    update_ok = (
                        card['title'] == update_data['title'] and
                        card['description'] == update_data['description']
                    )
                    self.log_test(
                        "Card Update API",
                        update_ok,
                        "Card updated successfully" if update_ok else "Card update fields mismatch"
                    )
                    return update_ok
                else:
                    self.log_test("Card Update API", False, "Response missing 'card' field")
                    return False
            else:
                self.log_test(
                    "Card Update API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Card Update API", False, f"Exception: {str(e)}")
            return False
    
    def test_activity_logging(self):
        """Test GET /api/activity and verify card activities are logged"""
        print(f"\n{Colors.BOLD}Test 4: Activity Logging{Colors.RESET}")
        
        # Wait a bit for activities to be logged
        time.sleep(1)
        
        url = f"{self.base_url}/api/activity"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'activities' in data:
                    activities = data['activities']
                    
                    # Check for card creation activity
                    create_activity = None
                    update_activity = None
                    
                    for activity in activities:
                        if activity.get('entityType') == 'card' and activity.get('entityId') == self.card_id:
                            if 'created' in activity.get('action', '').lower():
                                create_activity = activity
                            elif 'updated' in activity.get('action', '').lower():
                                update_activity = activity
                    
                    # Verify create activity
                    if create_activity:
                        fields_ok = (
                            create_activity.get('entityType') == 'card' and
                            create_activity.get('entityId') == self.card_id and
                            create_activity.get('boardId') == self.board_id and
                            'userId' in create_activity
                        )
                        self.log_test(
                            "Activity Logging - Card Creation",
                            fields_ok,
                            f"Activity logged with correct fields: entityType={create_activity.get('entityType')}, entityId={create_activity.get('entityId')}"
                        )
                        
                        # Check if user data is populated
                        user_populated = isinstance(create_activity.get('userId'), dict) and 'name' in create_activity.get('userId', {})
                        self.log_test(
                            "Activity User Population",
                            user_populated,
                            "User data populated in activity" if user_populated else "User data not populated"
                        )
                    else:
                        self.log_test(
                            "Activity Logging - Card Creation",
                            False,
                            "Card creation activity not found in activity feed"
                        )
                    
                    # Verify update activity
                    if update_activity:
                        self.log_test(
                            "Activity Logging - Card Update",
                            True,
                            "Card update activity logged successfully"
                        )
                    else:
                        self.log_test(
                            "Activity Logging - Card Update",
                            False,
                            "Card update activity not found in activity feed"
                        )
                    
                    return create_activity is not None
                else:
                    self.log_test("Activity Feed API", False, "Response missing 'activities' field")
                    return False
            else:
                self.log_test(
                    "Activity Feed API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Activity Feed API", False, f"Exception: {str(e)}")
            return False
    
    def test_card_deletion(self):
        """Test DELETE /api/cards/:id"""
        print(f"\n{Colors.BOLD}Test 5: Card Deletion{Colors.RESET}")
        
        if not self.card_id:
            self.log_test("Card Deletion API", False, "No card ID available for deletion test")
            return False
        
        url = f"{self.base_url}/api/cards/{self.card_id}"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.delete(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('ok'):
                    self.log_test("Card Deletion API", True, "Card deleted successfully")
                    
                    # Verify card is actually deleted
                    time.sleep(0.5)
                    verify_url = f"{self.base_url}/api/cards/{self.board_id}/cards"
                    verify_response = requests.get(verify_url, headers=headers)
                    
                    if verify_response.status_code == 200:
                        cards = verify_response.json().get('cards', [])
                        card_deleted = not any(c['_id'] == self.card_id for c in cards)
                        self.log_test(
                            "Card Deletion Verification",
                            card_deleted,
                            "Card removed from database" if card_deleted else "Card still exists in database"
                        )
                    
                    # Check deletion activity
                    time.sleep(1)
                    activity_url = f"{self.base_url}/api/activity"
                    activity_response = requests.get(activity_url, headers=headers)
                    
                    if activity_response.status_code == 200:
                        activities = activity_response.json().get('activities', [])
                        delete_activity = None
                        
                        for activity in activities:
                            if (activity.get('entityType') == 'card' and 
                                activity.get('entityId') == self.card_id and
                                'deleted' in activity.get('action', '').lower()):
                                delete_activity = activity
                                break
                        
                        self.log_test(
                            "Activity Logging - Card Deletion",
                            delete_activity is not None,
                            "Card deletion activity logged" if delete_activity else "Card deletion activity not found"
                        )
                    
                    return True
                else:
                    self.log_test("Card Deletion API", False, "Response missing 'ok' field")
                    return False
            else:
                self.log_test(
                    "Card Deletion API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Card Deletion API", False, f"Exception: {str(e)}")
            return False
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
        
        passed = sum(1 for r in self.test_results if r['passed'])
        total = len(self.test_results)
        
        print(f"\nTotal Tests: {total}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {total - passed}{Colors.RESET}")
        
        if total - passed > 0:
            print(f"\n{Colors.RED}Failed Tests:{Colors.RESET}")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  ✗ {result['test']}")
                    if result['message']:
                        print(f"    {result['message']}")
        
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        return passed == total

def main():
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}FlowSpace Backend Testing - Card Operations & Activity Logging{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    
    tester = FlowSpaceBackendTester()
    
    # Setup
    if not tester.setup_test_data():
        print(f"\n{Colors.RED}Failed to setup test data. Exiting.{Colors.RESET}")
        return False
    
    try:
        # Run tests
        tester.test_card_creation()
        tester.test_card_retrieval()
        tester.test_card_update()
        tester.test_activity_logging()
        tester.test_card_deletion()
        
        # Print summary
        all_passed = tester.print_summary()
        
        return all_passed
        
    finally:
        # Cleanup
        tester.cleanup_test_data()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
