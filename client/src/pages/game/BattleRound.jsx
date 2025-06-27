import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

const BattleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const BattleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BattleTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--light);
  font-family: var(--font-secondary);
`;

const BattleStats = styled.div`
  display: flex;
  gap: 20px;
`;

const StatBox = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatIcon = styled.i`
  color: var(--primary);
`;

const StatValue = styled.span`
  color: var(--light);
  font-weight: 600;
`;

const WeaponsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const Weapon = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${props => props.selected ? 'rgba(56, 182, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? 'var(--primary)' : 'transparent'};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
`;

const WeaponIcon = styled.div`
  font-size: 1.5rem;
  color: var(--light);
`;

const WeaponName = styled.div`
  font-size: 0.7rem;
  color: var(--light);
  margin-top: 5px;
`;

const BattleArena = styled.div`
  position: relative;
  width: 100%;
  min-height: 400px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-height: 300px;
  }
`;

const Monster = styled(motion.div)`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(255, 87, 87, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  font-size: ${props => props.size / 2}px;
  
  &:hover {
    box-shadow: 0 0 15px rgba(255, 87, 87, 0.7);
  }
`;

const MissEffect = styled(motion.div)`
  position: absolute;
  background-color: rgba(255, 87, 87, 0.7);
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
  pointer-events: none;
`;

const EmptyArenaMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--light);
  text-align: center;
`;

const ImposterNote = styled.div`
  margin-top: 20px;
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

const BattleRound = () => {
  const { battle, attackMonster, isImposter } = useGame();
  const [monsters, setMonsters] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('blaster');
  const [missPosition, setMissPosition] = useState(null);
  const [showMiss, setShowMiss] = useState(false);
  const arenaRef = useRef(null);
  
  useEffect(() => {
    const generateMonster = () => {
      if (monsters.length >= 5) return;
      
      const arenaWidth = arenaRef.current?.clientWidth || 600;
      const arenaHeight = arenaRef.current?.clientHeight || 400;
      
      const newMonster = {
        id: `monster-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        size: Math.floor(Math.random() * 40) + 40, // 40-80px
        position: {
          x: Math.random() * (arenaWidth - 100) + 50,
          y: Math.random() * (arenaHeight - 100) + 50
        }
      };
      
      setMonsters(prev => [...prev, newMonster]);
    };
    
    for (let i = 0; i < 3; i++) {
      generateMonster();
    }
    
    const interval = setInterval(generateMonster, 2000);
    
    return () => clearInterval(interval);
  }, [monsters.length]);
  
  const handleAttackMonster = (monster, event) => {
    if (isImposter && Math.random() < 0.7) {
      const rect = event.currentTarget.getBoundingClientRect();
      const arenaRect = arenaRef.current.getBoundingClientRect();
      
      setMissPosition({
        x: rect.left - arenaRect.left + rect.width / 2,
        y: rect.top - arenaRect.top + rect.height / 2
      });
      
      setShowMiss(true);
      setTimeout(() => setShowMiss(false), 1000);
      
      return;
    }
    
    setMonsters(prev => prev.filter(m => m.id !== monster.id));
    
    attackMonster(monster.id);
  };
  
  const weapons = [
    { id: 'blaster', name: 'Blaster', icon: '🔫' },
    { id: 'sword', name: 'Sword', icon: '⚔️' },
    { id: 'bow', name: 'Bow', icon: '🏹' }
  ];
  
  return (
    <BattleContainer>
      <BattleHeader>
        <BattleTitle>Monster Duel</BattleTitle>
        <BattleStats>
          <StatBox>
            <StatIcon className="fas fa-skull" />
            <StatValue>{battle.monstersDefeated} Defeated</StatValue>
          </StatBox>
          <StatBox>
            <StatIcon className="fas fa-ghost" />
            <StatValue>{monsters.length} Active</StatValue>
          </StatBox>
        </BattleStats>
      </BattleHeader>
      
      <WeaponsBar>
        {weapons.map(weapon => (
          <Weapon
            key={weapon.id}
            selected={selectedWeapon === weapon.id}
            onClick={() => setSelectedWeapon(weapon.id)}
          >
            <WeaponIcon>{weapon.icon}</WeaponIcon>
            <WeaponName>{weapon.name}</WeaponName>
          </Weapon>
        ))}
      </WeaponsBar>
      
      <BattleArena ref={arenaRef}>
        <AnimatePresence>
          {monsters.map(monster => (
            <Monster
              key={monster.id}
              size={monster.size}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                scale: { duration: 0.3 },
                x: { 
                  repeat: Infinity, 
                  repeatType: 'reverse', 
                  duration: 2 + Math.random() * 2 
                },
                y: { 
                  repeat: Infinity, 
                  repeatType: 'reverse', 
                  duration: 2 + Math.random() * 2 
                }
              }}
              style={{
                left: monster.position.x,
                top: monster.position.y
              }}
              onClick={(e) => handleAttackMonster(monster, e)}
            >
              👾
            </Monster>
          ))}
          
          {showMiss && missPosition && (
            <MissEffect
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                left: missPosition.x,
                top: missPosition.y
              }}
            >
              MISS!
            </MissEffect>
          )}
        </AnimatePresence>
        
        {monsters.length === 0 && (
          <EmptyArenaMessage>
            Waiting for monsters to appear...
          </EmptyArenaMessage>
        )}
      </BattleArena>
      
      {isImposter && (
        <ImposterNote>
          <ImposterTitle>
            <i className="fas fa-user-secret"></i>
            IMPOSTER MODE
          </ImposterTitle>
          <ImposterText>
            As the imposter, your goal is to slow down the team. Occasionally "miss" your attacks to prevent planet healing, but don't be too obvious or the team might suspect you.
          </ImposterText>
        </ImposterNote>
      )}
    </BattleContainer>
  );
};

export default BattleRound;