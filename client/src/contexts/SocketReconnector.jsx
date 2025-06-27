import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';

const ReconnectorContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: var(--light);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 350px;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.connected ? 'var(--tertiary)' : 'var(--secondary)'};
`;

const Message = styled.p`
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const Button = styled.button`
  background-color: var(--primary);
  border: none;
  color: var(--light);
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SocketReconnector = () => {
  const { socket, connected, connectionError, reconnect } = useSocket();
  const { gameId, currentRound } = useGame();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);


  useEffect(() => {
    if (!connected && gameId) {

      setShowPanel(true);
    } else {

      const timer = setTimeout(() => {
        setShowPanel(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, gameId]);


  useEffect(() => {
    if (!connected && gameId && reconnectCount < 3) {
      const timer = setTimeout(() => {
        handleReconnect();
      }, 5000); // Trying to reconnect every 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [connected, reconnectCount, gameId]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setReconnectCount(prev => prev + 1);
    
    try {
      const success = reconnect();
      console.log('Reconnect attempt result:', success);
      

      if (success) {
        setReconnectCount(0);
      }
    } catch (error) {
      console.error('Error during reconnection:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  if (!showPanel) return null;

  return (
    <ReconnectorContainer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <Title>
        <StatusDot connected={connected} />
        Connection Status: {connected ? 'Connected' : 'Disconnected'}
      </Title>
      
      {!connected && (
        <Message>
          {connectionError || 'Connection to game server lost. Your game actions may not be saved.'}
        </Message>
      )}
      
      {connected ? (
        <Message>Connection restored! You can continue playing.</Message>
      ) : (
        <Button 
          onClick={handleReconnect} 
          disabled={isReconnecting}
        >
          <i className="fas fa-sync-alt"></i>
          {isReconnecting ? 'Reconnecting...' : 'Reconnect Now'}
        </Button>
      )}
    </ReconnectorContainer>
  );
};

export default SocketReconnector;