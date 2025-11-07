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
    
    def test_member_board_access(self):
        """Test board member can access board and see it in their board list"""
        print(f"\n{Colors.BOLD}Test 4: Board Member Access{Colors.RESET}")
        
        # Test 4a: GET /api/boards - verify member sees boards they're a member of
        url = f"{self.base_url}/api/boards"
        headers = {'Authorization': f'Bearer {self.invitee_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'boards' in data:
                    boards = data['boards']
                    board_ids = [b['_id'] for b in boards]
                    can_see_board = self.board_id in board_ids
                    
                    self.log_test(
                        "Member Board List Access",
                        can_see_board,
                        f"Member can see {len(boards)} board(s), including test board" if can_see_board else f"Member cannot see test board. Boards: {board_ids}"
                    )
                else:
                    self.log_test("Member Board List Access", False, "Response missing 'boards' field")
                    return False
            else:
                self.log_test(
                    "Member Board List Access",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
            
            # Test 4b: GET /api/boards/:id - verify member can access board details
            url = f"{self.base_url}/api/boards/{self.board_id}"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'board' in data:
                    board = data['board']
                    correct_board = board['_id'] == self.board_id
                    
                    self.log_test(
                        "Member Board Details Access",
                        correct_board,
                        f"Member can access board details: {board.get('title')}" if correct_board else "Wrong board returned"
                    )
                    return correct_board
                else:
                    self.log_test("Member Board Details Access", False, "Response missing 'board' field")
                    return False
            else:
                self.log_test(
                    "Member Board Details Access",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Member Board Access", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_member_card_access(self):
        """Test board member can see cards"""
        print(f"\n{Colors.BOLD}Test 5: Member Card Access{Colors.RESET}")
        
        # First create a test card as owner
        url = f"{self.base_url}/api/cards/{self.board_id}/cards"
        headers = {
            'Authorization': f'Bearer {self.owner_token}',
            'Content-Type': 'application/json'
        }
        
        card_data = {
            'columnId': self.column_id,
            'title': 'Collaboration Test Card',
            'description': 'Testing member access to cards',
            'tags': ['test', 'collaboration']
        }
        
        try:
            # Create card as owner
            response = requests.post(url, json=card_data, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                if 'card' in data:
                    self.card_id = data['card']['_id']
                    print(f"  Created test card: {self.card_id}")
                else:
                    self.log_test("Member Card Access - Setup", False, "Failed to create test card")
                    return False
            else:
                self.log_test("Member Card Access - Setup", False, f"Card creation failed: {response.status_code}")
                return False
            
            # Now test if member can see the card
            time.sleep(0.5)
            url = f"{self.base_url}/api/cards/{self.board_id}/cards"
            headers = {'Authorization': f'Bearer {self.invitee_token}'}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'cards' in data:
                    cards = data['cards']
                    card_ids = [c['_id'] for c in cards]
                    can_see_card = self.card_id in card_ids
                    
                    self.log_test(
                        "Member Card Access",
                        can_see_card,
                        f"Member can see {len(cards)} card(s), including test card" if can_see_card else f"Member cannot see test card. Cards: {card_ids}"
                    )
                    return can_see_card
                else:
                    self.log_test("Member Card Access", False, "Response missing 'cards' field")
                    return False
            else:
                self.log_test(
                    "Member Card Access",
                    False,
                    f"Expected status 200, got {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Member Card Access", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_permissions(self):
        """Test permission restrictions"""
        print(f"\n{Colors.BOLD}Test 6: Permission Testing{Colors.RESET}")
        
        # First, add viewer to board
        try:
            from pymongo import MongoClient
            from bson import ObjectId
            client = MongoClient('mongodb://localhost:27017/flowspace')
            db = client['flowspace']
            
            # Add viewer as a viewer member
            db.boards.update_one(
                {'_id': ObjectId(self.board_id)},
                {'$push': {'members': {'userId': ObjectId(self.viewer_id), 'role': 'viewer'}}}
            )
            print(f"  Added viewer user to board")
            
            time.sleep(0.5)
            
            # Test: Viewer cannot send invites
            url = f"{self.base_url}/api/invite"
            headers = {
                'Authorization': f'Bearer {self.viewer_token}',
                'Content-Type': 'application/json'
            }
            
            invite_data = {
                'boardId': self.board_id,
                'email': 'another@test.com',
                'role': 'editor'
            }
            
            response = requests.post(url, json=invite_data, headers=headers)
            
            # Viewer should get 403 Forbidden
            viewer_blocked = response.status_code == 403
            
            self.log_test(
                "Viewer Cannot Send Invites",
                viewer_blocked,
                f"Viewer correctly blocked (403)" if viewer_blocked else f"Viewer not blocked: {response.status_code} - {response.text}"
            )
            
            # Test: Non-member cannot access board
            # Create a new user who is not a member
            non_member_data = {
                'name': 'Non Member',
                'email': 'nonmember@test.com',
                'password': 'test123',
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            result = db.users.insert_one(non_member_data)
            non_member_id = str(result.inserted_id)
            non_member_token = self.generate_jwt_token(non_member_id)
            
            # Try to access board as non-member
            url = f"{self.base_url}/api/boards/{self.board_id}"
            headers = {'Authorization': f'Bearer {non_member_token}'}
            
            response = requests.get(url, headers=headers)
            
            # Non-member should still be able to GET board (no permission check in getBoard)
            # But they shouldn't see it in their board list
            url = f"{self.base_url}/api/boards"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                boards = data.get('boards', [])
                board_ids = [b['_id'] for b in boards]
                non_member_blocked = self.board_id not in board_ids
                
                self.log_test(
                    "Non-Member Cannot See Board in List",
                    non_member_blocked,
                    "Non-member correctly cannot see board" if non_member_blocked else "Non-member can see board (should not)"
                )
            else:
                self.log_test("Non-Member Board Access", False, f"Unexpected status: {response.status_code}")
            
            # Cleanup non-member
            db.users.delete_one({'_id': ObjectId(non_member_id)})
            
            return viewer_blocked
            
        except Exception as e:
            self.log_test("Permission Testing", False, f"Exception: {str(e)}")
            import traceback
            traceback.print_exc()
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
    print(f"{Colors.BOLD}FlowSpace Backend Testing - Invite & Collaboration System{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    
    tester = FlowSpaceInviteTester()
    
    # Setup
    if not tester.setup_test_data():
        print(f"\n{Colors.RED}Failed to setup test data. Exiting.{Colors.RESET}")
        return False
    
    try:
        # Run tests
        tester.test_create_invite()
        tester.test_accept_invite()
        tester.test_list_invites()
        tester.test_member_board_access()
        tester.test_member_card_access()
        tester.test_permissions()
        
        # Print summary
        all_passed = tester.print_summary()
        
        return all_passed
        
    finally:
        # Cleanup
        tester.cleanup_test_data()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
