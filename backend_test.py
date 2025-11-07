#!/usr/bin/env python3
"""
Backend API Testing for FlowSpace Invite & Collaboration System
Tests invite creation, acceptance, and board member permissions
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

# Load JWT secret from .env file
def load_jwt_secret():
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if line.startswith('JWT_ACCESS_SECRET='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return 'emergent_flowspace_access_secret_'

JWT_SECRET = load_jwt_secret()

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class FlowSpaceInviteTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        # Owner user
        self.owner_token = None
        self.owner_id = None
        self.owner_email = 'owner@flowspace.com'
        # Invitee user
        self.invitee_token = None
        self.invitee_id = None
        self.invitee_email = 'invitee@flowspace.com'
        # Viewer user (for permission tests)
        self.viewer_token = None
        self.viewer_id = None
        self.viewer_email = 'viewer@flowspace.com'
        # Board and invite data
        self.board_id = None
        self.column_id = None
        self.card_id = None
        self.invite_token = None
        self.invite_link = None
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
        """Create test users and board"""
        print(f"\n{Colors.BOLD}Setting up test data...{Colors.RESET}")
        
        try:
            from pymongo import MongoClient
            from bson import ObjectId
            client = MongoClient('mongodb://localhost:27017/flowspace')
            db = client['flowspace']
            
            # Create owner user
            owner_user = db.users.find_one({'email': self.owner_email})
            if not owner_user:
                owner_data = {
                    'name': 'Board Owner',
                    'email': self.owner_email,
                    'password': 'owner123',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
                result = db.users.insert_one(owner_data)
                self.owner_id = str(result.inserted_id)
                print(f"  Created owner user: {self.owner_id}")
            else:
                self.owner_id = str(owner_user['_id'])
                print(f"  Using existing owner user: {self.owner_id}")
            
            self.owner_token = self.generate_jwt_token(self.owner_id)
            
            # Create invitee user
            invitee_user = db.users.find_one({'email': self.invitee_email})
            if not invitee_user:
                invitee_data = {
                    'name': 'Invited User',
                    'email': self.invitee_email,
                    'password': 'invitee123',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
                result = db.users.insert_one(invitee_data)
                self.invitee_id = str(result.inserted_id)
                print(f"  Created invitee user: {self.invitee_id}")
            else:
                self.invitee_id = str(invitee_user['_id'])
                print(f"  Using existing invitee user: {self.invitee_id}")
            
            self.invitee_token = self.generate_jwt_token(self.invitee_id)
            
            # Create viewer user (for permission tests)
            viewer_user = db.users.find_one({'email': self.viewer_email})
            if not viewer_user:
                viewer_data = {
                    'name': 'Viewer User',
                    'email': self.viewer_email,
                    'password': 'viewer123',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
                result = db.users.insert_one(viewer_data)
                self.viewer_id = str(result.inserted_id)
                print(f"  Created viewer user: {self.viewer_id}")
            else:
                self.viewer_id = str(viewer_user['_id'])
                print(f"  Using existing viewer user: {self.viewer_id}")
            
            self.viewer_token = self.generate_jwt_token(self.viewer_id)
            
            # Create test board owned by owner
            owner_obj_id = owner_user['_id'] if owner_user else ObjectId(self.owner_id)
            
            board_data = {
                'title': 'Collaboration Test Board',
                'description': 'Testing invite and collaboration features',
                'ownerId': owner_obj_id,
                'members': [{'userId': owner_obj_id, 'role': 'owner'}],
                'columns': [
                    {'_id': ObjectId(), 'title': 'To Do', 'order': 0},
                    {'_id': ObjectId(), 'title': 'In Progress', 'order': 1},
                    {'_id': ObjectId(), 'title': 'Done', 'order': 2}
                ],
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            board_result = db.boards.insert_one(board_data)
            self.board_id = str(board_result.inserted_id)
            self.column_id = str(board_data['columns'][0]['_id'])
            
            print(f"  Created test board: {self.board_id}")
            print(f"  Column ID: {self.column_id}")
            
            return True
            
        except Exception as e:
            print(f"{Colors.RED}Failed to setup test data: {str(e)}{Colors.RESET}")
            import traceback
            traceback.print_exc()
            return False
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print(f"\n{Colors.BOLD}Cleaning up test data...{Colors.RESET}")
        try:
            from pymongo import MongoClient
            from bson import ObjectId
            client = MongoClient('mongodb://localhost:27017/flowspace')
            db = client['flowspace']
            
            # Delete test invites
            if self.board_id:
                db.invites.delete_many({'boardId': ObjectId(self.board_id)})
                print(f"  Deleted test invites")
            
            # Delete test cards
            if self.board_id:
                db.cards.delete_many({'boardId': ObjectId(self.board_id)})
                print(f"  Deleted test cards")
                
                # Delete test board
                db.boards.delete_one({'_id': ObjectId(self.board_id)})
                print(f"  Deleted test board")
            
            # Delete test users
            db.users.delete_one({'email': self.owner_email})
            db.users.delete_one({'email': self.invitee_email})
            db.users.delete_one({'email': self.viewer_email})
            print(f"  Deleted test users")
            
        except Exception as e:
            print(f"{Colors.YELLOW}Warning: Cleanup failed: {str(e)}{Colors.RESET}")
    
    def test_create_invite(self):
        """Test POST /api/invite - Create invite link"""
        print(f"\n{Colors.BOLD}Test 1: Create Invite Link{Colors.RESET}")
        
        url = f"{self.base_url}/api/invite"
        headers = {
            'Authorization': f'Bearer {self.owner_token}',
            'Content-Type': 'application/json'
        }
        
        invite_data = {
            'boardId': self.board_id,
            'email': self.invitee_email,
            'role': 'editor'
        }
        
        try:
            response = requests.post(url, json=invite_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response fields
                has_token = 'token' in data
                has_link = 'inviteLink' in data
                has_success = data.get('success') == True
                
                self.log_test(
                    "Invite Creation API",
                    has_token and has_link and has_success,
                    f"Invite created with token and link" if (has_token and has_link) else f"Missing fields in response: {data}"
                )
                
                if has_token:
                    self.invite_token = data['token']
                    self.invite_link = data.get('inviteLink', '')
                    print(f"  Invite token: {self.invite_token}")
                    print(f"  Invite link: {self.invite_link}")
                    
                    # Verify invite in database
                    time.sleep(0.5)
                    from pymongo import MongoClient
                    client = MongoClient('mongodb://localhost:27017/flowspace')
                    db = client['flowspace']
                    
                    invite_doc = db.invites.find_one({'token': self.invite_token})
                    if invite_doc:
                        # Check fields
                        fields_ok = (
                            str(invite_doc['boardId']) == self.board_id and
                            invite_doc['email'] == self.invitee_email and
                            invite_doc['role'] == 'editor' and
                            invite_doc['status'] == 'pending'
                        )
                        
                        # Check expiry (should be ~7 days from now)
                        expiry_ok = invite_doc['expiresAt'] > datetime.utcnow()
                        days_until_expiry = (invite_doc['expiresAt'] - datetime.utcnow()).days
                        
                        self.log_test(
                            "Invite Database Verification",
                            fields_ok and expiry_ok,
                            f"Invite stored correctly, expires in {days_until_expiry} days" if (fields_ok and expiry_ok) else "Invite fields incorrect"
                        )
                    else:
                        self.log_test("Invite Database Verification", False, "Invite not found in database")
                    
                    return True
                else:
                    return False
            else:
                self.log_test(
                    "Invite Creation API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Invite Creation API", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_accept_invite(self):
        """Test POST /api/invite/:token/accept - Accept invite"""
        print(f"\n{Colors.BOLD}Test 2: Accept Invite{Colors.RESET}")
        
        if not self.invite_token:
            self.log_test("Accept Invite API", False, "No invite token available")
            return False
        
        url = f"{self.base_url}/api/invite/{self.invite_token}/accept"
        headers = {
            'Authorization': f'Bearer {self.invitee_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                success = data.get('success') == True
                has_board = 'board' in data
                
                self.log_test(
                    "Accept Invite API",
                    success and has_board,
                    f"Invite accepted successfully" if success else f"Response: {data}"
                )
                
                # Verify user added to board members
                time.sleep(0.5)
                from pymongo import MongoClient
                from bson import ObjectId
                client = MongoClient('mongodb://localhost:27017/flowspace')
                db = client['flowspace']
                
                board = db.boards.find_one({'_id': ObjectId(self.board_id)})
                if board:
                    member_ids = [str(m['userId']) for m in board.get('members', [])]
                    is_member = self.invitee_id in member_ids
                    
                    # Find the member entry
                    member_role = None
                    for m in board.get('members', []):
                        if str(m['userId']) == self.invitee_id:
                            member_role = m.get('role')
                            break
                    
                    self.log_test(
                        "Board Membership Verification",
                        is_member and member_role == 'editor',
                        f"User added to board with role: {member_role}" if is_member else "User not added to board members"
                    )
                else:
                    self.log_test("Board Membership Verification", False, "Board not found")
                
                # Verify invite status changed to 'accepted'
                invite_doc = db.invites.find_one({'token': self.invite_token})
                if invite_doc:
                    status_ok = invite_doc['status'] == 'accepted'
                    self.log_test(
                        "Invite Status Update",
                        status_ok,
                        f"Invite status: {invite_doc['status']}"
                    )
                else:
                    self.log_test("Invite Status Update", False, "Invite not found")
                
                return success
            else:
                self.log_test(
                    "Accept Invite API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Accept Invite API", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_list_invites(self):
        """Test GET /api/invite/board/:boardId - List invites"""
        print(f"\n{Colors.BOLD}Test 3: List Invites{Colors.RESET}")
        
        url = f"{self.base_url}/api/invite/board/{self.board_id}"
        headers = {'Authorization': f'Bearer {self.owner_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'invites' in data:
                    invites = data['invites']
                    
                    # Find our test invite
                    test_invite = None
                    for inv in invites:
                        if inv.get('email') == self.invitee_email:
                            test_invite = inv
                            break
                    
                    if test_invite:
                        # Check if user data is populated
                        has_invited_by = 'invitedBy' in test_invite
                        user_populated = False
                        if has_invited_by and isinstance(test_invite['invitedBy'], dict):
                            user_populated = 'name' in test_invite['invitedBy'] or 'email' in test_invite['invitedBy']
                        
                        self.log_test(
                            "List Invites API",
                            True,
                            f"Found {len(invites)} invite(s), test invite present"
                        )
                        
                        self.log_test(
                            "Invite User Population",
                            user_populated,
                            "User data populated in invite" if user_populated else "User data not populated"
                        )
                        
                        return True
                    else:
                        self.log_test(
                            "List Invites API",
                            False,
                            f"Test invite not found. Found {len(invites)} invites"
                        )
                        return False
                else:
                    self.log_test("List Invites API", False, "Response missing 'invites' field")
                    return False
            else:
                self.log_test(
                    "List Invites API",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("List Invites API", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_activity_logging(self):
        """Test GET /api/activity and verify card activities are logged"""
        print(f"\n{Colors.BOLD}Test 4: Activity Logging{Colors.RESET}")
        
        # Wait a bit for activities to be logged
        time.sleep(2)
        
        url = f"{self.base_url}/api/activity"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'activities' in data:
                    activities = data['activities']
                    
                    print(f"  Total activities retrieved: {len(activities)}")
                    
                    # Debug: Print all activities
                    for i, act in enumerate(activities[:5]):
                        print(f"    Activity {i+1}: {act.get('action')} (entityType: {act.get('entityType')}, entityId: {act.get('entityId')})")
                    
                    # Debug: Print recent card activities
                    card_activities = [a for a in activities if a.get('entityType') == 'card']
                    print(f"  Card activities found: {len(card_activities)}")
                    
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
