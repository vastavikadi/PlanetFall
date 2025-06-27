import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';

const VotingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const VotingHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const VotingTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--light);
  margin-bottom: 10px;
  font-family: var(--font-secondary);
`;

const VotingInstructions = styled.p`
  color: var(--light);
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
`;

const PlayerCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PlayerCard = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  border: 3px solid ${props => props.selected ? 'var(--primary)' : 'transparent'};
  transition: border-color 0.3s ease;
  
  &:hover {
    background-color: var(--card-bg);
  }
`;

const PlayerAvatar = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: var(--primary);
  color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 15px;
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--light);
  margin-bottom: 5px;
`;

const PlayerStats = styled.div`
  font-size: 0.9rem;
  color: var(--light);
  opacity: 0.7;
`;

const VoteActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const VoteButton = styled.button`
  padding: 12px 30px;
  background-color: var(--primary);
  color: var(--light);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--glow);
  }
  
  &:disabled {
    background-color: rgba(56, 182, 255, 0.4);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResultMessage = styled.div`
  text-align: center;
  margin-top: 30px;
  padding: 15px;
  background-color: rgba(56, 182, 255, 0.1);
  border-radius: 8px;
  color: var(--light);
`;

const ImposterNote = styled.div`
  margin-top: 30px;
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(255, 87, 87, 0.1);
  border: 1px solid var(--secondary);
`;

const ImposterTitle = styled.h4`
  color: var(--secondary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 10px;
  }
`;

const ImposterText = styled.p`
  color: var(--light);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const VotingRound = () => {
  const { user } = useAuth();
  const { gameData, submitVote, vote, isImposter } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  const hasVoted = vote.hasVoted;
  

  const votingOptions = gameData.players.filter(player => player.id !== user.id);
  
  const handleVote = () => {
    if (!selectedPlayer) return;
    
    submitVote(selectedPlayer);
  };
  
  return (
    <VotingContainer>
      <VotingHeader>
        <VotingTitle>Final Vote: Identify the Imposter</VotingTitle>
        <VotingInstructions>
          Based on the previous rounds, who do you think is secretly working against the team? Choose carefully - the planet's fate depends on your decision!
        </VotingInstructions>
      </VotingHeader>
      
      <PlayerCards>
        {votingOptions.map(player => (
          <PlayerCard
            key={player.id}
            selected={selectedPlayer === player.id}
            onClick={() => !hasVoted && setSelectedPlayer(player.id)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayerAvatar>
              {player.avatar || player.username?.charAt(0).toUpperCase() || '?'}
            </PlayerAvatar>
            <PlayerName>{player.username}</PlayerName>
            <PlayerStats>Score: {player.score || 0}</PlayerStats>
          </PlayerCard>
        ))}
      </PlayerCards>
      
      <VoteActions>
        <VoteButton 
          onClick={handleVote} 
          disabled={!selectedPlayer || hasVoted}
        >
          {hasVoted ? 'Vote Submitted' : 'Submit Vote'}
        </VoteButton>
      </VoteActions>
      
      {hasVoted && (
        <ResultMessage>
          Your vote has been cast. Waiting for other players to vote...
        </ResultMessage>
      )}
      
      {isImposter && (
        <ImposterNote>
          <ImposterTitle>
            <i className="fas fa-user-secret"></i>
            IMPOSTER MODE
          </ImposterTitle>
          <ImposterText>
            As the imposter, your goal is to avoid being identified. Vote strategically to deflect suspicion away from yourself. Consider voting for someone who performed poorly or made suspicious moves.
          </ImposterText>
        </ImposterNote>
      )}
    </VotingContainer>
  );
};

export default VotingRound;