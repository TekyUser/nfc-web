import { useState, useEffect } from 'react';
import { NFCCard } from '../types';

const STORAGE_KEY = 'nfc-cards';

export function useNFCCards() {
  const [cards, setCards] = useState<NFCCard[]>([]);

  useEffect(() => {
    const storedCards = localStorage.getItem(STORAGE_KEY);
    if (storedCards) {
      try {
        setCards(JSON.parse(storedCards));
      } catch (error) {
        console.error('Error parsing stored cards:', error);
      }
    }
  }, []);

  const saveCards = (newCards: NFCCard[]) => {
    setCards(newCards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
  };

  const assignCard = (cardData: Omit<NFCCard, 'id' | 'assignedAt'>) => {
    const existingCard = cards.find(card => card.nfcId === cardData.nfcId);
    if (existingCard) {
      throw new Error('This NFC card has already been assigned');
    }

    const newCard: NFCCard = {
      ...cardData,
      id: Date.now().toString(),
      assignedAt: Date.now(),
    };

    saveCards([...cards, newCard]);
    return newCard;
  };

  const getCardInfo = (nfcId: string): NFCCard | null => {
    const card = cards.find(card => card.nfcId === nfcId && card.isActive);
    return card || null;
  };

  const deactivateCard = (cardId: string) => {
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, isActive: false } : card
    );
    saveCards(updatedCards);
  };

  const getActiveCards = (): NFCCard[] => {
    return cards.filter(card => card.isActive);
  };

  return {
    cards,
    assignCard,
    getCardInfo,
    deactivateCard,
    getActiveCards,
  };
}
