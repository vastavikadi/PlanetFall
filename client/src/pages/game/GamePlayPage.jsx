import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../hooks/useGame";
import QuizRound from "./QuizRound";
import BattleRound from "./BattleRound";
import VotingRound from "./VotingRound";
import PlanetStatus from "./PlanetStatus";
import PlayerList from "./PlayerList";
import Modal from "../../components/comman/Modal";

const GamePlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background);
  position: relative;
  overflow: hidden;
`;

const GameHeader = styled.div`
  background-color: var(--dark);
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const RoundTransition = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  flex-direction: column;
`;

const TransitionPlanet = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #5b8cff, #1c4db5);
  margin-bottom: 30px;
  box-shadow: 0 0 50px rgba(91, 140, 255, 0.7);
`;

const TransitionText = styled(motion.h2)`
  color: var(--light);
  font-size: 2rem;
  text-align: center;
  font-family: var(--font-secondary);
`;

const LeaveButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 87, 87, 0.2);
  border: none;
  color: var(--light);
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  z-index: 15;

  &:hover {
    background: rgba(255, 87, 87, 0.4);
  }

  @media (max-width: 768px) {
    top: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 20px;
  margin: 20px;
  text-align: center;
  color: var(--light);

  h3 {
    color: var(--secondary);
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 15px;
  }

  button {
    margin-top: 10px;
  }
`;

const GamePlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loadGameDetails,
    isLoading,
    gameData,
    dispatch,
    currentRound,
    planetHealth,
    isImposter,
    leaveGame,
    error,
    resetGame,
    updateCurrentRound
  } = useGame();

  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [attemptedAutoFix, setAttemptedAutoFix] = useState(false);

  const fetchGameDetails = useCallback(async () => {
    if (!id) {
      setLoadError("Game ID is missing");
      return;
    }

    try {
      await loadGameDetails(id);
      setLoadError(null);
    } catch (error) {
      console.error("Error loading game details:", error);
      setLoadError(error.message || "Failed to load game details");
      if (error.code !== "ERR_NETWORK" && loadAttempts >= 3) {
        navigate("/dashboard");
      }
    }
  }, [id, loadGameDetails, navigate, loadAttempts]);

  useEffect(() => {
    if (gameData && gameData.status === 'in_progress' && currentRound === -1 && !attemptedAutoFix) {
      console.log("Game is in progress but round is -1, attempting to fix state");
      
      if (typeof updateCurrentRound === 'function') {

        updateCurrentRound(0);
      } else {
        console.warn("updateCurrentRound function not available, cannot auto-fix game state");
      }

      setAttemptedAutoFix(true);
    }
  }, [gameData, currentRound, updateCurrentRound, attemptedAutoFix]);

  const handleManualFix = useCallback(() => {
    if (typeof updateCurrentRound === 'function') {
      console.log("Manually fixing game state - setting round to 0");
      updateCurrentRound(0);
      setAttemptedAutoFix(true);
    } else {
      console.warn("updateCurrentRound function not available, cannot manually fix game state");
    }
  }, [updateCurrentRound]);

  useEffect(() => {
    let isMounted = true;

    const loadGame = async () => {
      if (isMounted) {
        await fetchGameDetails();
        if (isMounted) {
          setLoadAttempts((prev) => prev + 1);
        }
      }
    };

    loadGame();

    const interval = setInterval(() => {
      if (isMounted && (!gameData || currentRound === -1)) {
        loadGame();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchGameDetails, gameData, currentRound]);

  useEffect(() => {
    console.log("Game Data:", gameData);
  }, [gameData]);

  useEffect(() => {
    if (currentRound >= 0) {
      const roundNames = ["Knowledge Quiz", "Monster Duel", "Final Vote"];
      setTransitionMessage(
        `Round ${currentRound + 1}: ${roundNames[currentRound]}`
      );
      setShowTransition(true);

      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentRound]);

  useEffect(() => {
    console.log("Current round in GameplayPage:", currentRound);
  }, [currentRound]);
  

  const handleLeaveGame = async () => {
    try {
      await leaveGame(id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving game:", error);
    }
  };

  const handleRetry = () => {
    setLoadAttempts(0);
    fetchGameDetails();
  };

  if (isLoading && !gameData) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Connecting to game...</p>
      </div>
    );
  }

  if (loadError && loadAttempts >= 3) {
    return (
      <ErrorMessage>
        <h3>Error Loading Game</h3>
        <p>{loadError}</p>
        <button className="btn btn-primary" onClick={handleRetry}>
          Retry
        </button>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </button>
      </ErrorMessage>
    );
  }

  return (
    <GamePlayContainer>
      <GameHeader>
        <PlanetStatus
          health={planetHealth}
          maxHealth={100}
          isImposter={isImposter}
          currentRound={currentRound}
        />
      </GameHeader>

      <LeaveButton onClick={() => setShowLeaveModal(true)}>
        <i className="fas fa-sign-out-alt"></i> Leave
      </LeaveButton>

      <GameContent>
        {gameData?.players && (
          <PlayerList players={gameData.players} currentPlayerId={user?.id} />
        )}

        {gameData?.currentRound === 0 && <QuizRound />}
        {gameData?.currentRound === 1 && <BattleRound />}
        {gameData?.currentRound === 2 && <VotingRound />}

        {currentRound === -1 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "50px",
              color: "var(--light)",
            }}
          >
            <h2>Game is starting...</h2>
            <p>Please wait while all players get ready.</p>
          </div>
        )}
      </GameContent>

      {gameData?.status === 'in_progress' && currentRound === -1 && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'var(--light)' }}>Game State Needs Fixing</h3>
          <p style={{ color: 'var(--light)' }}>The game has started but your view is stuck.</p>
          <button 
            className="btn btn-primary"
            onClick={handleManualFix}
          >
            <i className="fas fa-sync-alt"></i> Fix Game State
          </button>
        </div>
      )}
      <AnimatePresence>
        {showTransition && (
          <RoundTransition
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TransitionPlanet
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 50px rgba(91, 140, 255, 0.7)",
                  "0 0 70px rgba(91, 140, 255, 0.9)",
                  "0 0 50px rgba(91, 140, 255, 0.7)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <TransitionText
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {transitionMessage}
            </TransitionText>
          </RoundTransition>
        )}
      </AnimatePresence>

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Leave Game"
      >
        <p>Are you sure you want to leave the game? Your team may need you!</p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn btn-outline"
            onClick={() => setShowLeaveModal(false)}
          >
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={handleLeaveGame}>
            Leave Game
          </button>
        </div>
      </Modal>
    </GamePlayContainer>
  );
};
export default GamePlayPage;