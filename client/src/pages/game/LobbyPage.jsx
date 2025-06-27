import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../hooks/useGame";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../../components/comman/Modal";
import { startGame } from "../../services/gameService";

const LobbyContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const LobbyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const LobbyTitle = styled.h1`
  font-size: 2rem;
  color: var(--primary);
  font-family: var(--font-secondary);
  text-shadow: var(--text-shadow);
`;

const LobbyActions = styled.div`
  display: flex;
  gap: 15px;
`;

const GameInfoBox = styled.div`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
`;

const GameDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
`;

const GameDetail = styled.div`
  flex: 1;
  min-width: 200px;
`;

const DetailLabel = styled.div`
  color: var(--light);
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  color: var(--light);
  font-size: 1.1rem;
  font-weight: 600;
`;

const PlayersSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--light);
  margin-bottom: 20px;
  display: flex;
  align-items: center;

  i {
    color: var(--primary);
    margin-right: 10px;
  }
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const PlayerCard = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PlayerAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary);
  color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 600;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--light);
  margin-bottom: 5px;
`;

const PlayerStatus = styled.div`
  color: var(--tertiary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;

  i {
    margin-right: 5px;
  }
`;

const EmptySlot = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light);
  opacity: 0.6;
  min-height: 106px;
`;

const GameRulesSection = styled.div`
  margin-bottom: 30px;
`;

const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const RuleCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 20px;
`;

const RuleTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  i {
    margin-right: 10px;
  }
`;

const RuleDescription = styled.p`
  color: var(--light);
  font-size: 0.9rem;
  line-height: 1.6;
`;

const LoadingButton = styled.button`
  position: relative;
  
  &.loading {
    padding-right: 40px;
  }
  
  .spinner {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: translateY(-50%) rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: var(--secondary);
  margin-top: 10px;
  font-size: 0.9rem;
`;

const LobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameData, isLoading, loadGameDetails, leaveGame } = useGame();
  
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [startError, setStartError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;

    const fetchGameDetails = async () => {
      if (!id) {
        console.error("Game ID is undefined");
        if (isMounted) navigate("/dashboard");
        return;
      }

      try {
        if (isMounted) await loadGameDetails(id);
      } catch (error) {
        console.error("Error loading game details:", error);
        if (isMounted && error.code !== "ERR_NETWORK") {
          navigate("/dashboard");
        }
      }
    };

    fetchGameDetails();

    const interval = setInterval(fetchGameDetails, 5000);


    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);


  useEffect(() => {
    console.log("Game status:", gameData?.status);
    if (gameData?.status === "in_progress") {
      navigate(`/play/${id}`);
    }
  }, [gameData, id, navigate]);

  const handleStartGame = async () => {
    try {
      setStartingGame(true);
      setStartError(null);
      console.log("Starting game with ID:", id);
      

      await startGame(id);
      

      await loadGameDetails(id);
      

      navigate(`/play/${id}`);
    } catch (error) {
      console.error("Error starting game:", error);
      setStartError(error.message || "Failed to start the game");
    } finally {
      setStartingGame(false);
    }
  };

  const handleLeaveGame = async () => {
    try {
      await leaveGame(id); // Using id parameter
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving game:", error);
    }
  };

  if (isLoading || !gameData) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading lobby...</p>
      </div>
    );
  }


  const isCreator = gameData?.creatorId === user?.id;
  const gameMode =
    gameData?.gameMode === "imposter"
      ? "Imposter Mode"
      : gameData?.gameMode === "regular"
      ? "Salvation Mode"
      : "Chaos Mode";


  const playerCount = gameData?.players?.length || 0;
  const maxPlayers = gameData?.maxPlayers || 4;
  const emptySlots = Array(Math.max(0, maxPlayers - playerCount)).fill(null);

  return (
    <LobbyContainer>
      <LobbyHeader>
        <LobbyTitle>Game Lobby</LobbyTitle>
        <LobbyActions>
          <button
            className="btn btn-outline"
            onClick={() => setShowLeaveModal(true)}
            disabled={startingGame}
          >
            Leave Lobby
          </button>

          {isCreator && playerCount >= 2 && (
            <LoadingButton 
              className={`btn btn-primary ${startingGame ? 'loading' : ''}`} 
              onClick={handleStartGame}
              disabled={startingGame}
            >
              {startingGame ? 'Starting...' : 'Start Game'}
              {startingGame && <span className="spinner"></span>}
            </LoadingButton>
          )}
        </LobbyActions>
      </LobbyHeader>

      {startError && (
        <ErrorMessage>
          <i className="fas fa-exclamation-circle"></i> {startError}
        </ErrorMessage>
      )}

      <GameInfoBox>
        <GameDetails>
          <GameDetail>
            <DetailLabel>Game Mode</DetailLabel>
            <DetailValue>{gameMode}</DetailValue>
          </GameDetail>

          <GameDetail>
            <DetailLabel>Host</DetailLabel>
            <DetailValue>{gameData.creatorName || "Unknown"}</DetailValue>
          </GameDetail>

          <GameDetail>
            <DetailLabel>Players</DetailLabel>
            <DetailValue>
              {playerCount}/{maxPlayers}
            </DetailValue>
          </GameDetail>

          <GameDetail>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>
              {gameData.status === 'in_progress' ? 'Game Started' : 'Waiting for players'}
            </DetailValue>
          </GameDetail>
        </GameDetails>

        {isCreator && playerCount < 2 && (
          <div
            className="alert"
            style={{ color: "var(--secondary)", textAlign: "center" }}
          >
            Need at least 2 players to start the game!
          </div>
        )}
      </GameInfoBox>

      <PlayersSection>
        <SectionTitle>
          <i className="fas fa-users"></i>
          Players
        </SectionTitle>

        <PlayersGrid>
          <AnimatePresence>
            {gameData.players &&
              gameData.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <PlayerAvatar>
                    {player.avatar ||
                      (player.username &&
                        player.username.charAt(0).toUpperCase()) ||
                      "?"}
                  </PlayerAvatar>
                  <PlayerInfo>
                    <PlayerName>{player.username}</PlayerName>
                    <PlayerStatus>
                      <i className="fas fa-check-circle"></i>
                      Ready
                    </PlayerStatus>
                  </PlayerInfo>
                  {isCreator && player.id === user.id && (
                    <div
                      className="badge"
                      style={{ fontSize: "0.7rem", color: "var(--primary)" }}
                    >
                      Host
                    </div>
                  )}
                </PlayerCard>
              ))}

            {emptySlots.map((_, index) => (
              <EmptySlot
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                Waiting for player...
              </EmptySlot>
            ))}
          </AnimatePresence>
        </PlayersGrid>
      </PlayersSection>

      <GameRulesSection>
        <SectionTitle>
          <i className="fas fa-scroll"></i>
          Game Rules
        </SectionTitle>

        <RulesGrid>
          <RuleCard>
            <RuleTitle>
              <i className="fas fa-brain"></i>
              Round 1: Knowledge Quiz
            </RuleTitle>
            <RuleDescription>
              Answer trivia questions related to your interests. Each correct
              answer slows planetary destruction. Imposters receive suggestions
              for wrong answers to sabotage subtly.
            </RuleDescription>
          </RuleCard>

          <RuleCard>
            <RuleTitle>
              <i className="fas fa-ghost"></i>
              Round 2: Monster Duel
            </RuleTitle>
            <RuleDescription>
              Fight monsters to heal the planet. Every monster defeated adds
              health to your dying world. Imposters can "miss" their attacks to
              prevent healing.
            </RuleDescription>
          </RuleCard>

          <RuleCard>
            <RuleTitle>
              <i className="fas fa-vote-yea"></i>
              Round 3: Final Vote
            </RuleTitle>
            <RuleDescription>
              Based on the previous rounds, vote to identify the imposter. A
              correct identification fully heals the planet. A wrong vote leads
              to planetary destruction.
            </RuleDescription>
          </RuleCard>
        </RulesGrid>
      </GameRulesSection>

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Leave Lobby"
      >
        <p>Are you sure you want to leave this game lobby?</p>
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
            Leave
          </button>
        </div>
      </Modal>
    </LobbyContainer>
  );
};

export default LobbyPage;