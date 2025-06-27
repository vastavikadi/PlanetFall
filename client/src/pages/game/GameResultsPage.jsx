import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

const ResultsContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(
      circle at 50% 30%, 
      ${props => props.success ? 'rgba(87, 217, 130, 0.15)' : 'rgba(255, 87, 87, 0.15)'} 0%, 
      transparent 70%
    );
    z-index: 0;
  }
`;

const ResultsContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const PlanetImage = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 30px;
  background: ${props => props.success 
    ? 'radial-gradient(circle at 30% 30%, #57d982, #2a8c53)' 
    : 'radial-gradient(circle at 30% 30%, #ff5757, #b02a2a)'};
  box-shadow: ${props => props.success 
    ? '0 0 50px rgba(87, 217, 130, 0.5)' 
    : '0 0 50px rgba(255, 87, 87, 0.5)'};
    
  @media (max-width: 576px) {
    width: 150px;
    height: 150px;
  }
`;

const ResultTitle = styled.h1`
  font-size: 3rem;
  color: ${props => props.success ? 'var(--tertiary)' : 'var(--secondary)'};
  text-align: center;
  margin-bottom: 15px;
  font-family: var(--font-secondary);
  
  @media (max-width: 576px) {
    font-size: 2.2rem;
  }
`;

const ResultMessage = styled.p`
  font-size: 1.2rem;
  color: var(--light);
  text-align: center;
  max-width: 600px;
  margin-bottom: 40px;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--light);
  font-size: 1rem;
  opacity: 0.8;
`;

const TokensEarned = styled.div`
  background-color: ${props => props.success ? 'rgba(87, 217, 130, 0.1)' : 'rgba(56, 182, 255, 0.1)'};
  border: 2px solid ${props => props.success ? 'var(--tertiary)' : 'var(--primary)'};
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 40px;
`;

const TokensTitle = styled.div`
  font-size: 1.2rem;
  color: var(--light);
  margin-bottom: 10px;
`;

const TokensValue = styled.div`
  font-size: 3rem;
  color: ${props => props.success ? 'var(--tertiary)' : 'var(--primary)'};
  font-weight: 700;
  font-family: var(--font-secondary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const GameResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { results, isLoading, loadGameDetails, resetGame } = useGame();
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!results) {
          await loadGameDetails(id);
        }
      } catch (error) {
        console.error('Error loading game results:', error);
        navigate('/dashboard');
      }
    };
    
    fetchResults();
  }, [id, results, loadGameDetails, navigate]);
  
  const handlePlayAgain = () => {
    resetGame();
    navigate('/dashboard');
  };
  
  if (isLoading || !results) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }
  
  const { success, correctAnswers, monstersDefeated, finalHealth, tokensEarned } = results;
  
  return (
    <ResultsContainer success={success}>
      <ResultsContent>
        <PlanetImage 
          success={success}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
        
        <ResultTitle success={success}>
          {success ? 'Planet Saved!' : 'Planet Lost!'}
        </ResultTitle>
        
        <ResultMessage>
          {success 
            ? 'Congratulations! You successfully identified the imposter and saved the planet from destruction.' 
            : 'The team failed to identify the imposter. The planet\'s destruction is imminent.'}
        </ResultMessage>
        
        <StatsGrid>
          <StatCard>
            <StatValue>{correctAnswers}</StatValue>
            <StatLabel>Correct Answers</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{monstersDefeated}</StatValue>
            <StatLabel>Monsters Defeated</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{finalHealth}%</StatValue>
            <StatLabel>Final Planet Health</StatLabel>
          </StatCard>
        </StatsGrid>
        
        <TokensEarned success={success}>
          <TokensTitle>You Earned</TokensTitle>
          <TokensValue success={success}>{tokensEarned} ST</TokensValue>
        </TokensEarned>
        
        <ActionButtons>
          <button 
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
          
          <button 
            className="btn btn-primary btn-lg"
            onClick={handlePlayAgain}
          >
            Play Again
          </button>
        </ActionButtons>
      </ResultsContent>
    </ResultsContainer>
  );
};

export default GameResultsPage;