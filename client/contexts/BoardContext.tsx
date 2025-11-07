import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Board, listBoards, createBoard, getBoard } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';

interface BoardContextType {
  currentBoard: Board | null;
  boards: Board[];
  cards: any[];
  isLoading: boolean;
  error: string | null;
  setCurrentBoard: (board: Board | null) => void;
  setCards: (cards: any[] | ((prev: any[]) => any[])) => void;
  refreshBoards: () => Promise<void>;
  createDemoBoard: () => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading } = useAuth();
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBoards = async () => {
    try {
      setIsLoading(true);
      const data = await listBoards();
      setBoards(data.boards || []);
      
      // If no boards exist, create a demo board
      if (!data.boards || data.boards.length === 0) {
        await createDemoBoard();
      } else if (!currentBoard) {
        // Set the first board as current
        const firstBoard = data.boards[0];
        const boardData = await getBoard(firstBoard._id);
        setCurrentBoard(boardData.board);
        
        // Join socket room for this board
        const socket = getSocket();
        socket.emit('joinBoard', firstBoard._id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoBoard = async () => {
    try {
      const data = await createBoard({
        title: 'Demo Board',
        description: 'A demo board to get you started',
      });
      const newBoard = data.board;
      setBoards([newBoard]);
      
      // Fetch full board details
      const boardData = await getBoard(newBoard._id);
      setCurrentBoard(boardData.board);
      
      // Join socket room
      const socket = getSocket();
      socket.emit('joinBoard', newBoard._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demo board');
    }
  };

  useEffect(() => {
    // Only load boards after auth is complete
    if (authLoading) return;
    
    refreshBoards();

    return () => {
      if (currentBoard) {
        const socket = getSocket();
        socket.emit('leaveBoard', currentBoard._id);
      }
    };
  }, [authLoading]);

  return (
    <BoardContext.Provider
      value={{
        currentBoard,
        boards,
        cards,
        isLoading,
        error,
        setCurrentBoard,
        setCards,
        refreshBoards,
        createDemoBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
