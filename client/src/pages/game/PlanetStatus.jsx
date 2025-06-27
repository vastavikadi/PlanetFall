import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const PlanetHealthContainer = styled.div`
  flex: 1;
  margin-right: 20px;
  
  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const HealthLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  
  span {
    font-size: 0.9rem;
    color: var(--light);
  }
  
  .health-value {
    font-weight: 600;
    color: ${props => {
      if (props.health > 60) return 'var(--tertiary)';
      if (props.health > 30) return 'orange';
      return 'var(--secondary)';
    }};
  }
`;

const HealthBarContainer = styled.div`
  height: 10px;
  background-color: rgba(255, 87, 87, 0.3);
  border-radius: 5px;
  overflow: hidden;
`;

const HealthBar = styled.div`
  height: 100%;
  width: ${props => `${props.percent}%`};
  background: ${props => {
    if (props.percent > 60) return 'linear-gradient(to right, #57d982, #57ccd9)';
    if (props.percent > 30) return 'linear-gradient(to right, #d9c557, #d98a57)';
    return 'linear-gradient(to right, #ff5757, #ff8c57)';
  }};
  transition: width 0.5s ease, background 0.5s ease;
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const RoundInfo = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 5px;
`;

const Timer = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--light);
`;

const ImposterBadge = styled.div`
  padding: 5px 10px;
  background-color: rgba(255, 87, 87, 0.2);
  border-radius: 4px;
  color: var(--secondary);
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-top: 5px;
  
  i {
    margin-right: 5px;
  }
`;

const PulseAnimation = styled.span`
  display: inline-block;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
`;

const PlanetStatus = ({ health, maxHealth, currentRound, isImposter }) => {
  const [timer, setTimer] = useState(120); // 2 minutes default
  const [roundTimers] = useState({
    0: 180, // 3 minutes for quiz round
    1: 240, // 4 minutes for battle round
    2: 120  // 2 minutes for voting round
  });
  

  const prevRoundRef = useRef(-1);
  

  useEffect(() => {
    if (currentRound !== prevRoundRef.current && currentRound >= 0) {

      setTimer(roundTimers[currentRound] || 120);
      prevRoundRef.current = currentRound;
    }
  }, [currentRound, roundTimers]);
  

  useEffect(() => {

    if (currentRound < 0) return;
    
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentRound]);
  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  

  const getRoundName = () => {
    if (currentRound < 0) {
      return (
        <>
          Preparing Game <PulseAnimation>...</PulseAnimation>
        </>
      );
    }
    
    const rounds = ['Knowledge Quiz', 'Monster Duel', 'Final Vote'];
    return currentRound < rounds.length
      ? `Round ${currentRound + 1}: ${rounds[currentRound]}`
      : 'Game Complete';
  };
  

  const healthPercent = Math.min(100, Math.max(0, (health / maxHealth) * 100));
  
  return (
    <StatusContainer>
      <PlanetHealthContainer>
        <HealthLabel health={healthPercent}>
          <span>Planet Health</span>
          <span className="health-value">{Math.round(healthPercent)}%</span>
        </HealthLabel>
        <HealthBarContainer>
          <HealthBar percent={healthPercent} />
        </HealthBarContainer>
      </PlanetHealthContainer>
      
      <GameInfo>
        <RoundInfo>{getRoundName()}</RoundInfo>
        {currentRound >= 0 && (
          <Timer>{formatTime(timer)}</Timer>
        )}
        {isImposter && (
          <ImposterBadge>
            <i className="fas fa-user-secret"></i>
            IMPOSTER MODE
          </ImposterBadge>
        )}
      </GameInfo>
    </StatusContainer>
  );
};

export default PlanetStatus;