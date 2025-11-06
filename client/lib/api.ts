// API utility functions with authentication
import { getAccessToken } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

function getHeaders() {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: Array<{ userId: any; role: string }>;
  columns: Array<{ _id: string; title: string; order: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  boardId: string;
  content: string;
  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

// Board APIs
export async function createBoard(data: { title: string; description?: string }) {
  const response = await fetch(`${API_URL}/api/boards`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create board');
  return response.json();
}

export async function listBoards() {
  const response = await fetch(`${API_URL}/api/boards`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch boards');
  return response.json();
}

export async function getBoard(boardId: string) {
  const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch board');
  return response.json();
}

// Card APIs - fetch all cards for a board
export async function listCards(boardId: string) {
  const response = await fetch(`${API_URL}/api/cards/${boardId}/cards`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });\n  if (!response.ok) throw new Error('Failed to fetch cards');\n  return response.json();\n}

export async function createCard(boardId: string, data: Partial<Card>) {
  const response = await fetch(`${API_URL}/api/cards/${boardId}/cards`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create card');
  return response.json();
}

export async function updateCard(cardId: string, updates: Partial<Card>) {
  const response = await fetch(`${API_URL}/api/cards/${cardId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update card');
  return response.json();
}

export async function deleteCard(cardId: string) {
  const response = await fetch(`${API_URL}/api/cards/${cardId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete card');
  return response.json();
}

// Note APIs
export async function getNote(boardId: string) {
  const response = await fetch(`${API_URL}/api/${boardId}/notes`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    // If not found, return empty note
    if (response.status === 404) {
      return { note: { boardId, content: '', _id: '', createdAt: '', updatedAt: '' } };
    }
    throw new Error('Failed to fetch note');
  }
  return response.json();
}

export async function updateNote(boardId: string, content: string) {
  const response = await fetch(`${API_URL}/api/${boardId}/notes`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}
