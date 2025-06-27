import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import { getGames, getGameHistory } from '../../services/gameService';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: 40px;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 10px;
  font-family: var(--font-secondary);
  text-shadow: var(--text-shadow);
`;

const StatsSection = styled.div`
  margin-bottom: 40px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--light);
  font-size: 0.9rem;
  opacity: 0.8;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--light);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 10px;
    color: var(--primary);
  }
`;

const GameModesContainer = styled.div`
  margin-bottom: 40px;
`;

const GameModeCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const GameModeCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
`;

const GameModeImage = styled.div`
  height: 160px;
  background-image: ${props => `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props.image})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GameModeTitle = styled.div`
  font-size: 1.5rem;
  color: var(--light);
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const GameModeContent = styled.div`
  padding: 20px;
`;

const GameModeDescription = styled.p`
  color: var(--light);
  opacity: 0.9;
  margin-bottom: 15px;
  line-height: 1.6;
`;

const CreateGameModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--light);
  font-size: 1.5rem;
  cursor: pointer;
`;

const ActiveGamesSection = styled.div`
  margin-bottom: 40px;
`;

const GamesList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
`;

const GameCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--card-bg);
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const GameInfo = styled.div`
  flex: 1;
`;

const GameName = styled.div`
  font-size: 1.1rem;
  color: var(--light);
  margin-bottom: 5px;
`;

const GameDetails = styled.div`
  display: flex;
  gap: 15px;
  color: var(--light);
  opacity: 0.8;
  font-size: 0.9rem;
  
  @media (max-width: 576px) {
    margin-bottom: 10px;
  }
`;

const GameActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const DashboardPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [activeGames, setActiveGames] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { createGame, joinGame } = useGame();
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const [activeGamesData, historyData] = await Promise.all([
          getGames(),
          getGameHistory()
        ]);
        
        setActiveGames(activeGamesData);
        setGameHistory(historyData);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    
    fetchGames();
  }, []);
  
  const handleCreateGame = async () => {
    if (!selectedGameMode) return;
    
    setIsLoading(true);
    
    try {
      const gameData = await createGame({
        gameMode: selectedGameMode,
        maxPlayers
      });
      
      setIsCreateModalOpen(false);
      navigate(`/lobby/${gameData.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoinGame = async (gameId) => {
    setIsLoading(true);
    
    try {
      await joinGame(gameId);
      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const stats = {
    gamesPlayed: gameHistory.length || 0,
    gamesWon: gameHistory.filter(g => g.outcome === 'team_win').length || 0,
    winRate: gameHistory.length 
      ? Math.round((gameHistory.filter(g => g.outcome === 'team_win').length / gameHistory.length) * 100) 
      : 0,
    tokensEarned: gameHistory.reduce((sum, game) => sum + (game.tokensEarned || 0), 0)
  };
  const userName=localStorage.getItem('username');
  
  const gameModes = [
    {
      id: 'imposter',
      title: 'Imposter Mode',
      description: 'One player secretly works against the team. Can you identify the saboteur before your planet is destroyed?',
      image: '/images/imposter-mode.jpg'
    },
    {
      id: 'regular',
      title: 'Salvation Mode',
      description: 'Work together with your team to save the planet. No imposters, just pure cooperation against the planet\'s destruction.',
      image: '/images/salvation-mode.jpg'
    },
    {
      id: 'chaos',
      title: 'Chaos Mode',
      description: 'Roles can change mid-game! Be ready to adapt as defenders might become imposters and vice versa.',
      image: '/images/chaos-mode.jpg'
    }
  ];
  
  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome, {userName}!</WelcomeTitle>
        <p>Ready to save the planet? Or perhaps secretly destroy it...</p>
      </WelcomeSection>
      
      <StatsSection>
        <SectionTitle>
          <i className="fas fa-chart-bar"></i>
          Your Stats
        </SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.gamesPlayed}</StatValue>
            <StatLabel>Games Played</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.gamesWon}</StatValue>
            <StatLabel>Planets Saved</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.winRate}%</StatValue>
            <StatLabel>Win Rate</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.tokensEarned}</StatValue>
            <StatLabel>Tokens Earned</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>
      
      <GameModesContainer>
        <SectionTitle>
          <i className="fas fa-gamepad"></i>
          Game Modes
        </SectionTitle>
        <GameModeCards>
          {gameModes.map(mode => (
            <GameModeCard 
              key={mode.id}
              onClick={() => {
                setSelectedGameMode(mode.id);
                setIsCreateModalOpen(true);
              }}
            >
              {/* <GameModeImage image={mode.image}> */}
                <GameModeTitle>{mode.title}</GameModeTitle>
              {/* </GameModeImage> */}
              <GameModeContent>
                <GameModeDescription>{mode.description}</GameModeDescription>
                <button className="btn btn-primary btn-sm">Start Game</button>
              </GameModeContent>
            </GameModeCard>
          ))}
        </GameModeCards>
      </GameModesContainer>
      
      {activeGames.length > 0 && (
        <ActiveGamesSection>
          <SectionTitle>
            <i className="fas fa-rocket"></i>
            Active Games
          </SectionTitle>
          <GamesList>
            {activeGames.map(game => (
              <GameCard key={game.id}>
                <GameInfo>
                  <GameName>{game.creatorName}'s Game</GameName>
                  <GameDetails>
                    <span><i className="fas fa-users"></i> {game.players.length}/{game.maxPlayers}</span>
                    <span><i className="fas fa-tag"></i> {game.gameMode === 'imposter' ? 'Imposter Mode' : 
                      game.gameMode === 'regular' ? 'Salvation Mode' : 'Chaos Mode'}</span>
                  </GameDetails>
                </GameInfo>
                <GameActions>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoinGame(game.id)}
                    disabled={isLoading}
                  >
                    Join Game
                  </button>
                </GameActions>
              </GameCard>
            ))}
          </GamesList>
        </ActiveGamesSection>
      )}
      
      {isCreateModalOpen && (
        <CreateGameModal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New Game</ModalTitle>
              <CloseButton onClick={() => setIsCreateModalOpen(false)}>
                <i className="fas fa-times"></i>
              </CloseButton>
            </ModalHeader>
            
            <div className="form-control">
              <label className="form-label">Game Mode</label>
              <select 
                className="form-input"
                value={selectedGameMode}
                onChange={(e) => setSelectedGameMode(e.target.value)}
              >
                <option value="imposter">Imposter Mode</option>
                <option value="regular">Salvation Mode</option>
                <option value="chaos">Chaos Mode</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="form-label">Max Players</label>
              <select 
                className="form-input"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              >
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
                <option value="5">5 Players</option>
                <option value="6">6 Players</option>
                <option value="7">7 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateGame}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </ModalContent>
        </CreateGameModal>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;