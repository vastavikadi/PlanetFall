import styled from 'styled-components';
import { motion } from 'framer-motion';

const PlayersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

const PlayerCard = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
  
  ${props => props.isCurrentPlayer && `
    border: 2px solid var(--primary);
    background-color: rgba(56, 182, 255, 0.1);
  `}
`;

const PlayerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary);
  color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--light);
`;

const PlayerScore = styled.div`
  font-size: 0.8rem;
  color: var(--light);
  opacity: 0.7;
`;

const PlayerBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  padding: 3px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: ${props => props.isImposter ? 'var(--secondary)' : 'var(--tertiary)'};
  color: var(--light);
`;

const PlayerList = ({ players, currentPlayerId }) => {
  return (
    <PlayersContainer>
      {players.map(player => (
        <PlayerCard 
          key={player.id}
          isCurrentPlayer={player.id === currentPlayerId}
          whileHover={{ y: -5 }}
        >
          <PlayerAvatar>
            {player.avatar || player.username?.charAt(0).toUpperCase() || '?'}
          </PlayerAvatar>
          <PlayerInfo>
            <PlayerName>{player.username}</PlayerName>
            <PlayerScore>Score: {player.score || 0}</PlayerScore>
          </PlayerInfo>
        </PlayerCard>
      ))}
    </PlayersContainer>
  );
};

export default PlayerList;