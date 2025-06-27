import axios from 'axios';

const API_URL = '/api/games';

const getConfig = () => {
  const token = localStorage.getItem('token');
  console.log('DEBUG: Auth token retrieved', token ? 'Token exists' : 'No token found');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createGame = async (gameOptions) => {
  console.log('DEBUG: Creating game with options:', gameOptions);
  try {
    const response = await axios.post(API_URL, gameOptions, getConfig());
    console.log('DEBUG: Game created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('DEBUG: Error creating game:', error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const getGames = async () => {
  console.log('DEBUG: Fetching all games');
  try {
    const response = await axios.get(API_URL, getConfig());
    console.log('DEBUG: Games fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('DEBUG: Error fetching games:', error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const getGameHistory = async () => {
  console.log('DEBUG: Fetching game history');
  try {
    const response = await axios.get(`${API_URL}/history`, getConfig());
    console.log('DEBUG: Game history fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('DEBUG: Error fetching game history:', error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const getGameDetails = async (gameId) => {
  console.log(`DEBUG: Fetching game details for ID: ${gameId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    console.log(`DEBUG: Making API call to ${API_URL}/${gameId}`);
    const response = await axios.get(`${API_URL}/${gameId}`, getConfig());
    console.log('DEBUG: Game details fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error fetching game details for ID ${gameId}:`, error);
    
    if (error.response) {
      console.error('DEBUG: Server response status:', error.response.status);
      console.error('DEBUG: Server response data:', error.response.data);
      console.error('DEBUG: Server response headers:', error.response.headers);
    } else if (error.request) {
      console.error('DEBUG: No response received:', error.request);
    } else {
      console.error('DEBUG: Error setting up request:', error.message);
    }
    
    throw error;
  }
};

export const joinGame = async (gameId) => {
  console.log(`DEBUG: Joining game with ID: ${gameId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(`${API_URL}/${gameId}/join`, {}, getConfig());
    console.log('DEBUG: Game joined successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error joining game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const leaveGame = async (gameId) => {
  console.log(`DEBUG: Leaving game with ID: ${gameId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(`${API_URL}/${gameId}/leave`, {}, getConfig());
    console.log('DEBUG: Left game successfully:', response.data);
    return response.data.message;
  } catch (error) {
    console.error(`DEBUG: Error leaving game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const startGame = async (gameId) => {
  console.log(`DEBUG: Starting game with ID: ${gameId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(`${API_URL}/${gameId}/start`, {}, getConfig());
    console.log('DEBUG: Game started successfully:', response.data);
    return response.data.message;
  } catch (error) {
    console.error(`DEBUG: Error starting game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const submitAnswer = async (gameId, questionIndex, answerIndex) => {
  console.log(`DEBUG: Submitting answer for game ID: ${gameId}, question: ${questionIndex}, answer: ${answerIndex}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/${gameId}/answer`, 
      { questionIndex, answerIndex }, 
      getConfig()
    );
    console.log('DEBUG: Answer submitted successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error submitting answer for game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const defeatMonster = async (gameId, monsterId) => {
  console.log(`DEBUG: Defeating monster in game ID: ${gameId}, monster: ${monsterId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/${gameId}/monster`, 
      { monsterId }, 
      getConfig()
    );
    console.log('DEBUG: Monster defeated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error defeating monster in game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const endBattleRound = async (gameId) => {
  console.log(`DEBUG: Ending battle round for game ID: ${gameId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/${gameId}/battle/end`, 
      {}, 
      getConfig()
    );
    console.log('DEBUG: Battle round ended successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error ending battle round for game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const submitVote = async (gameId, targetId) => {
  console.log(`DEBUG: Submitting vote for game ID: ${gameId}, target: ${targetId}`);
  
  if (!gameId) {
    console.error('DEBUG: Game ID is missing or undefined');
    throw new Error('Game ID is required');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/${gameId}/vote`, 
      { targetId }, 
      getConfig()
    );
    console.log('DEBUG: Vote submitted successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`DEBUG: Error submitting vote for game ID ${gameId}:`, error);
    console.error('DEBUG: Error details:', error.response?.data || error.message);
    throw error;
  }
};