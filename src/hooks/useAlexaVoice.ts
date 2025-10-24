import { useEffect } from 'react';
import { AlexaVoiceService, VoiceCommand } from '../services/AlexaVoiceService';

interface UseAlexaVoiceProps {
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
  gameCleared: boolean;
  shipSelectedRef: React.RefObject<boolean>;
  resetGame: () => void;
  setGameStarted: (started: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  setShowShipSelector: (show: boolean) => void;
}

export const useAlexaVoice = ({
  gameStarted,
  gamePaused,
  gameOver,
  gameCleared,
  shipSelectedRef,
  resetGame,
  setGameStarted,
  setGamePaused,
  setShowShipSelector
}: UseAlexaVoiceProps) => {
  
  useEffect(() => {
    const initializeVoice = async () => {
      const success = await AlexaVoiceService.initialize();
      if (success) {
        console.log('Alexa Voice Service initialized');
        
        const commands: VoiceCommand[] = [
          {
            command: 'start game',
            action: () => {
              if (!gameStarted && !gameOver && !gameCleared) {
                console.log('Voice command: Starting game');
                
                // Auto-select default ship if no ship selected
                if (!shipSelectedRef.current) {
                  console.log('Auto-selecting default blue ship');
                  shipSelectedRef.current = true;
                  setShowShipSelector(false);
                }
                
                setGameStarted(true);
              }
            }
          },
          {
            command: 'pause game',
            action: () => {
              if (gameStarted && !gameOver && !gameCleared) {
                console.log('Voice command: Pausing game');
                setGamePaused(true);
              }
            }
          },
          {
            command: 'resume game',
            action: () => {
              if (gameStarted && !gameOver && !gameCleared) {
                console.log('Voice command: Resuming game');
                setGamePaused(false);
              }
            }
          },
          {
            command: 'restart game',
            action: () => {
              console.log('Voice command: Restarting game');
              resetGame();
            }
          },
          {
            command: 'new game',
            action: () => {
              console.log('Voice command: New game');
              resetGame();
            }
          }
        ];

        AlexaVoiceService.registerCommands(commands);
        AlexaVoiceService.startListening();
      }
    };

    initializeVoice();

    return () => {
      AlexaVoiceService.stopListening();
    };
  }, []);

  // Update voice listening based on game state
  useEffect(() => {
    if (gameStarted) {
      AlexaVoiceService.startListening();
    }
  }, [gameStarted, gameOver, gameCleared]);
};
