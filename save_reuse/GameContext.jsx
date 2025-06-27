import { createContext, useReducer, useEffect, useCallback } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
import {
  createGame,
  joinGame,
  leaveGame,
  getGameDetails,
} from "../services/gameService";


const initialGameState = {
  gameId: null,
  gameData: null,
  players: [],
  isLoading: false,
  isInGame: false,
  currentRound: -1,
  planetHealth: 30,
  isImposter: false,
  quiz: {
    questions: [],
    currentQuestion: 0,
    answers: {},
  },
  battle: {
    monsters: [],
    monstersDefeated: 0,
  },
  vote: {
    votes: {},
    hasVoted: false,
  },
  results: null,
  error: null,
  lastFetched: null, // Track when we last fetched game data
};


function gameReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_GAME":
      return {
        ...state,
        gameId: action.payload.id,
        gameData: action.payload,
        isInGame: true,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      };
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    case "SET_ROUND":
      return { ...state, currentRound: action.payload };
    case "SET_PLANET_HEALTH":
      return { ...state, planetHealth: action.payload };
    case "SET_IS_IMPOSTER":
      return { ...state, isImposter: action.payload };
    case "SET_QUIZ_DATA":
      return { ...state, quiz: { ...state.quiz, ...action.payload } };
    case "SET_BATTLE_DATA":
      return { ...state, battle: { ...state.battle, ...action.payload } };
    case "SET_VOTE_DATA":
      return { ...state, vote: { ...state.vote, ...action.payload } };
    case "SUBMIT_ANSWER":
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answers: {
            ...state.quiz.answers,
            [action.payload.questionIndex]: action.payload.answerIndex,
          },
        },
      };
    case "REGISTER_MONSTER_DEFEAT":
      return {
        ...state,
        battle: {
          ...state.battle,
          monstersDefeated: state.battle.monstersDefeated + 1,
        },
      };
    case "SUBMIT_VOTE":
      return {
        ...state,
        vote: {
          ...state.vote,
          hasVoted: true,
          votes: {
            ...state.vote.votes,
            [action.payload.voterId]: action.payload.targetId,
          },
        },
      };
    case "SET_RESULTS":
      return { ...state, results: action.payload, isInGame: false };
    case "RESET_GAME":
      return initialGameState;

    case "UPDATE_CURRENT_ROUND":
      return { ...state, currentRound: action.payload };

    case "SET_GAME_ID":
      return { ...state, gameId: action.payload };
    default:
      return state;
  }
}


export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { socket } = useSocket();
  const { user } = useAuth();


  useEffect(() => {
    if (!socket) return;


    socket.on("player_joined", (player) => {
      dispatch({ type: "SET_PLAYERS", payload: [...state.players, player] });
    });


    socket.on("player_left", (playerId) => {
      dispatch({
        type: "SET_PLAYERS",
        payload: state.players.filter((p) => p.id !== playerId),
      });
    });


    socket.on("game_started", (gameData) => {
      console.log("🎮 Game started event received:", gameData);

      dispatch({ type: "SET_GAME", payload: gameData });


      const currentPlayer = gameData.players.find((p) => p.id === user?.id);
      if (currentPlayer && currentPlayer.role === "imposter") {
        dispatch({ type: "SET_IS_IMPOSTER", payload: true });
      }


      dispatch({
        type: "SET_GAME_ID",
        payload: gameData.id,
      });

      dispatch({ type: "SET_ROUND", payload: gameData.currentRound });

      console.log("Game state updated after game_started event");
    });


    socket.on("round_started", (data) => {
      console.log("🎲 Round started event received:", data);

      dispatch({ type: "SET_ROUND", payload: data.roundIndex });

      if (data.roundIndex === 0) {

        dispatch({
          type: "SET_QUIZ_DATA",
          payload: { questions: data.questions },
        });
      } else if (data.roundIndex === 1) {

        dispatch({ type: "SET_BATTLE_DATA", payload: { monsters: [] } });
      }

      console.log(`Round state updated to: ${data.roundIndex}`);
    });


    socket.on("player_answered", ({ planetHealth }) => {
      dispatch({ type: "SET_PLANET_HEALTH", payload: planetHealth });
    });


    socket.on("round_change", ({roundIndex}) => {
      console.log("Received round update from server:", roundIndex);
      updateCurrentRound(roundIndex);
    });


    socket.on("monster_spawned", (monster) => {
      dispatch({
        type: "SET_BATTLE_DATA",
        payload: { monsters: [...state.battle.monsters, monster] },
      });
    });


    socket.on("monster_defeated", (monsterId) => {
      dispatch({
        type: "SET_BATTLE_DATA",
        payload: {
          monsters: state.battle.monsters.filter((m) => m.id !== monsterId),
        },
      });
      dispatch({ type: "REGISTER_MONSTER_DEFEAT" });
    });


    socket.on("vote_submitted", (voteData) => {
      dispatch({ type: "SUBMIT_VOTE", payload: voteData });
    });


    socket.on("game_ended", (results) => {
      dispatch({ type: "SET_RESULTS", payload: results });
    });


    return () => {
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("game_started");
      socket.off("round_started");
      socket.off("player_answered");
      socket.off("round_change");
      socket.off("monster_spawned");
      socket.off("monster_defeated");
      socket.off("vote_submitted");
      socket.off("game_ended");
    };
  }, [socket, state.players, state.battle.monsters, user]);


  const handleCreateGame = useCallback(async (gameOptions) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await createGame(gameOptions);
      dispatch({ type: "SET_GAME", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, []);


  const updateCurrentRound = useCallback((roundIndex) => {
    console.log(`Manually updating current round to ${roundIndex}`);
    dispatch({ type: "UPDATE_CURRENT_ROUND", payload: roundIndex });
  }, []);


  const handleJoinGame = useCallback(async (gameId) => {
    if (!gameId) {
      const errorMsg = "Game ID is required to join a game";
      dispatch({ type: "SET_ERROR", payload: errorMsg });
      throw new Error(errorMsg);
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await joinGame(gameId);
      dispatch({ type: "SET_GAME", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, []);


  const handleLeaveGame = useCallback(
    async (gameId) => {
      if (!gameId) {
        gameId = state.gameId; // Fallback to the current game ID if not provided
      }

      if (!gameId) {
        const errorMsg = "Game ID is required to leave a game";
        dispatch({ type: "SET_ERROR", payload: errorMsg });
        throw new Error(errorMsg);
      }

      try {
        await leaveGame(gameId);
        dispatch({ type: "RESET_GAME" });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        throw error;
      }
    },
    [state.gameId]
  );

  const submitAnswer = useCallback(
    (questionIndex, answerIndex) => {

      const gameId = state.gameId;
      


      dispatch({
        type: "SUBMIT_ANSWER",
        payload: { questionIndex, answerIndex },
      });
  

      if (!socket) {
        console.warn("Socket connection is missing, storing answer locally only");
        

        if (!window._pendingGameActions) {
          window._pendingGameActions = [];
        }
        
        window._pendingGameActions.push({
          type: 'submit_answer',
          data: {
            gameId: gameId || state.gameData?.id,
            questionIndex,
            answerIndex
          }
        });
        

        return;
      }
  
      if (!gameId && !state.gameData?.id) {
        console.error("Game ID is missing", {
          stateGameId: state.gameId,
          gameDataId: state.gameData?.id,
        });
        

        return;
      }
  

      const effectiveGameId = gameId || state.gameData.id;
  
      console.log(
        `Submitting answer for question ${questionIndex}: ${answerIndex} in game ${effectiveGameId}`
      );
  

      try {
        socket.emit("submit_answer", {
          gameId: effectiveGameId,
          questionIndex,
          answerIndex,
        });
      } catch (error) {
        console.error("Error emitting socket event:", error);
        

        if (!window._pendingGameActions) {
          window._pendingGameActions = [];
        }
        
        window._pendingGameActions.push({
          type: 'submit_answer',
          data: {
            gameId: effectiveGameId,
            questionIndex,
            answerIndex
          }
        });
      }
    },
    [socket, state.gameId, state.gameData]
  );


  const attackMonster = useCallback(
    (monsterId) => {
      if (!socket || !state.gameId) {
        console.error("Cannot attack monster: Socket or Game ID is missing");
        return;
      }

      socket.emit("attack_monster", {
        gameId: state.gameId,
        monsterId,
      });
    },
    [socket, state.gameId]
  );


  const submitVote = useCallback(
    (targetId) => {
      if (!socket || !state.gameId) {
        console.error("Cannot submit vote: Socket or Game ID is missing");
        return;
      }

      socket.emit("submit_vote", {
        gameId: state.gameId,
        targetId,
      });

      dispatch({
        type: "SUBMIT_VOTE",
        payload: { voterId: user?.id, targetId },
      });
    },
    [socket, state.gameId, user]
  );


  const loadGameDetails = useCallback(
    async (gameId) => {
      if (!gameId) {
        const errorMsg = "Game ID is required to load game details";
        dispatch({ type: "SET_ERROR", payload: errorMsg });
        throw new Error(errorMsg);
      }


      const currentTime = Date.now();
      const minTimeBetweenFetches = 3000; // 3 seconds

      if (
        state.lastFetched &&
        currentTime - state.lastFetched < minTimeBetweenFetches &&
        state.gameId === gameId
      ) {
        return state.gameData;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const data = await getGameDetails(gameId);
        dispatch({ type: "SET_GAME", payload: data });
        return data;
      } catch (error) {

        if (error.code !== "ERR_NETWORK") {
          dispatch({ type: "SET_ERROR", payload: error.message });
        } else {

          console.error("Network error while fetching game details:", error);
          dispatch({ type: "SET_LOADING", payload: false });
        }
        throw error;
      }
    },
    [state.lastFetched, state.gameId, state.gameData]
  );


  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        createGame: handleCreateGame,
        joinGame: handleJoinGame,
        leaveGame: handleLeaveGame,
        submitAnswer,
        attackMonster,
        submitVote,
        loadGameDetails,
        resetGame,
        updateCurrentRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};