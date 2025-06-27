const mongoose = require("mongoose");
const Game = require("../models/Game");
const User = require("../models/User");
const Question = require("../models/Question");
const { v4: uuidv4 } = require("uuid");

const { ObjectId } = mongoose.Types;
/**
 * @desc    Create a new game
 * @route   POST /api/games
 * @access  Private
 */
exports.createGame = async (req, res, next) => {
  try {
    const { gameMode, maxPlayers } = req.body;

    const roomId = uuidv4();


    const game = await Game.create({
      roomId,
      gameMode,
      maxPlayers: maxPlayers || 4,
      creatorId: req.user.id,
      players: [{ userId: req.user.id }],
    });


    await game.populate("creatorId", "username");
    await game.populate("players.userId", "username");

    res.status(201).json({
      success: true,
      data: {
        id: game._id,
        roomId: game.roomId,
        gameMode: game.gameMode,
        maxPlayers: game.maxPlayers,
        status: game.status,
        creatorId: game.creatorId._id,
        creatorName: game.creatorId.username,
        players: game.players.map((player) => ({
          id: player.userId._id,
          username: player.userId.username,
          score: player.score,
        })),
        playerCount: game.players.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a game
 * @route   POST /api/games/:id/join
 * @access  Private
 */
exports.joinGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Game has already started",
      });
    }


    const playerExists = game.players.some(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerExists) {
      return res.status(400).json({
        success: false,
        message: "You are already in this game",
      });
    }


    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: "Game is full",
      });
    }


    game.players.push({ userId: req.user.id });
    await game.save();


    await game.populate("creatorId", "username");
    await game.populate("players.userId", "username");

    res.status(200).json({
      success: true,
      data: {
        id: game._id,
        roomId: game.roomId,
        gameMode: game.gameMode,
        maxPlayers: game.maxPlayers,
        status: game.status,
        creatorId: game.creatorId._id,
        creatorName: game.creatorId.username,
        players: game.players.map((player) => ({
          id: player.userId._id,
          username: player.userId.username,
          score: player.score,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave a game
 * @route   POST /api/games/:id/leave
 * @access  Private
 */
exports.leaveGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Cannot leave a game that has already started",
      });
    }


    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not in this game",
      });
    }


    game.players.splice(playerIndex, 1);


    if (game.creatorId.toString() === req.user.id && game.players.length > 0) {
      game.creatorId = game.players[0].userId;
    }


    if (game.players.length === 0) {
      await Game.findByIdAndDelete(game._id);

      return res.status(200).json({
        success: true,
        message: "Game deleted because all players left",
      });
    }

    await game.save();

    res.status(200).json({
      success: true,
      message: "Successfully left the game",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a game
 * @route   POST /api/games/:id/start
 * @access  Private
 */
exports.startGame = async (req, res, next) => {
  try {
    console.log(`Attempting to start game with ID: ${req.params.id}`);

    const game = await Game.findById(req.params.id);

    if (!game) {
      console.log("Game not found");
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.creatorId.toString() !== req.user.id) {
      console.log("User is not the creator");
      return res.status(403).json({
        success: false,
        message: "Only the game creator can start the game",
      });
    }


    if (game.status !== "waiting") {
      console.log("Game has already started");
      return res.status(400).json({
        success: false,
        message: "Game has already started",
      });
    }


    if (game.players.length < 2) {
      console.log("Not enough players");
      return res.status(400).json({
        success: false,
        message: "Need at least 2 players to start the game",
      });
    }


    console.log("Assigning roles to players...");
    const playerCount = game.players.length;


    game.players.forEach((player, index) => {
      player.role = index === 0 ? "imposter" : "defender";
    });


    console.log("Creating quiz round with valid ObjectIds...");
    const dummyQuestions = [
      {
        questionId: new ObjectId(),
        text: "Which programming language was used to write the first version of Twitter?",
        options: ["Ruby on Rails", "PHP", "Python", "Java"],
        correctAnswer: 0,
        playerAnswers: [],
      },
      {
        questionId: new ObjectId(),
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Multi Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language",
        ],
        correctAnswer: 0,
        playerAnswers: [],
      },
      {
        questionId: new ObjectId(),
        text: "Which of these is NOT a JavaScript framework or library?",
        options: ["Angular", "React", "Django", "Vue"],
        correctAnswer: 2,
        playerAnswers: [],
      },
      {
        questionId: new ObjectId(),
        text: "What is the most common use of CSS?",
        options: ["To define the structure of web pages", "To style web pages", "To create interactive elements", "To connect to databases"],
        correctAnswer: 1,
        playerAnswers: [],
      },
      {
        questionId: new ObjectId(),
        text: "Which data structure follows the LIFO principle?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correctAnswer: 1,
        playerAnswers: [],
      },
    ];


    game.rounds = [
      {
        type: "quiz",
        startedAt: new Date(),
        questions: dummyQuestions,
      },
    ];


    console.log("Updating game status to in_progress");
    game.status = "in_progress";
    game.startedAt = new Date();
    

    try {

      await game.save();
      console.log("Game saved successfully");
    } catch (saveError) {
      console.error("Error saving game:", saveError);
      return res.status(500).json({
        success: false,
        message: "Failed to update game status: " + saveError.message,
      });
    }

    const gameData = {
      id: game._id,
      roomId: game.roomId,
      status: game.status,
      currentRound: 0,
      planetHealth: game.planetHealth,
      players: game.players.map(player => ({
        id: player.userId,
        role: player.role
      })),
      rounds: game.rounds.map(round => ({
        type: round.type,
        startedAt: round.startedAt
      }))
    };


    const io = req.app.get("io");
    
    if (io) {
      console.log(`Emitting game_started event to room ${game.roomId}`);
      

      io.to(game.roomId).emit("game_started", gameData);
      

      io.to(game.roomId).emit("round_started", {
        roundIndex: 0,
        type: "quiz",
        questions: game.rounds[0].questions
      });
      

      console.log("Socket events emitted for game start");
    } else {
      console.log("Socket.io not available");
    }

    res.status(200).json({
      success: true,
      message: "Game started successfully",
      data: gameData
    });
  } catch (error) {
    console.error("Error in startGame controller:", error);
    next(error);
  }
};

/**
 * @desc    Get all active games
 * @route   GET /api/games
 * @access  Private
 */
exports.getGames = async (req, res, next) => {
  try {
    const games = await Game.find({ status: "waiting" })
      .populate("creatorId", "username")
      .populate("players.userId", "username");

    res.status(200).json({
      success: true,
      count: games.length,
      data: games.map((game) => ({
        id: game._id,
        roomId: game.roomId,
        gameMode: game.gameMode,
        maxPlayers: game.maxPlayers,
        status: game.status,
        creatorId: game.creatorId._id,
        creatorName: game.creatorId.username,
        players: game.players.map((player) => ({
          id: player.userId._id,
          username: player.userId.username,
          score: player.score,
        })),
        createdAt: game.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's game history
 * @route   GET /api/games/history
 * @access  Private
 */
exports.getGameHistory = async (req, res, next) => {
  try {
    const games = await Game.find({
      "players.userId": req.user.id,
      status: "completed",
    }).sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games.map((game) => {
        const playerData = game.players.find(
          (player) => player.userId.toString() === req.user.id
        );

        return {
          id: game._id,
          gameMode: game.gameMode,
          status: game.status,
          outcome: game.outcome,
          role: playerData.role,
          score: playerData.score,
          tokensEarned: playerData.tokensEarned,
          createdAt: game.createdAt,
          completedAt: game.completedAt,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single game
 * @route   GET /api/games/:id
 * @access  Private
 */
exports.getGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("creatorId", "username")
      .populate("players.userId", "username");

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: game._id,
        roomId: game.roomId,
        gameMode: game.gameMode,
        maxPlayers: game.maxPlayers,
        status: game.status,
        planetHealth: game.planetHealth,
        creatorId: game.creatorId._id,
        creatorName: game.creatorId.username,
        players: game.players.map((player) => ({
          id: player.userId._id,
          username: player.userId.username,
          role: player.userId.toString() === req.user.id ? player.role : null, // Only show role to the player
          score: player.score,
        })),
        currentRound: getCurrentRoundIndex(game),
        outcome: game.outcome,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
        completedAt: game.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answer for quiz round
 * @route   POST /api/games/:id/answer
 * @access  Private
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionIndex, answerIndex } = req.body;

    if (questionIndex === undefined || answerIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide both questionIndex and answerIndex",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Game is not in progress",
      });
    }


    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not in this game",
      });
    }


    if (getCurrentRoundIndex(game) !== 0) {
      return res.status(400).json({
        success: false,
        message: "Current round is not quiz",
      });
    }

    const quizRound = game.rounds[0];


    if (!quizRound.questions[questionIndex]) {
      return res.status(400).json({
        success: false,
        message: "Question not found",
      });
    }


    const alreadyAnswered = quizRound.questions[
      questionIndex
    ].playerAnswers.some((answer) => answer.userId.toString() === req.user.id);

    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: "You have already answered this question",
      });
    }


    const isCorrect =
      answerIndex === quizRound.questions[questionIndex].correctAnswer;


    quizRound.questions[questionIndex].playerAnswers.push({
      userId: req.user.id,
      answerIndex,
      isCorrect,
    });


    if (isCorrect) {
      game.players[playerIndex].score += 10;


      if (game.players[playerIndex].role !== "imposter") {
        game.planetHealth = Math.min(100, game.planetHealth + 5);
      }
    } else {

      game.planetHealth = Math.max(0, game.planetHealth - 3);
    }


    const allAnswered = quizRound.questions.every(
      (question) => question.playerAnswers.length === game.players.length
    );


    if (allAnswered) {
      quizRound.completedAt = Date.now();


      if (game.rounds.length === 1) {
        game.rounds.push({
          type: "battle",
          startedAt: Date.now(),
        });
      }
    }

    await game.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        planetHealth: game.planetHealth,
        currentRound: getCurrentRoundIndex(game),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Defeat monster in battle round
 * @route   POST /api/games/:id/monster
 * @access  Private
 */
exports.defeatMonster = async (req, res, next) => {
  try {
    const { monsterId } = req.body;

    if (!monsterId) {
      return res.status(400).json({
        success: false,
        message: "Please provide monsterId",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Game is not in progress",
      });
    }


    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not in this game",
      });
    }


    if (getCurrentRoundIndex(game) !== 1) {
      return res.status(400).json({
        success: false,
        message: "Current round is not battle",
      });
    }

    const battleRound = game.rounds[1];


    battleRound.playerActions.push({
      userId: req.user.id,
      action: "defeat",
      targetId: monsterId,
    });


    battleRound.monstersDefeated += 1;


    game.players[playerIndex].score += 20;


    if (game.players[playerIndex].role !== "imposter") {
      game.planetHealth = Math.min(100, game.planetHealth + 3);
    }

    await game.save();

    res.status(200).json({
      success: true,
      data: {
        monstersDefeated: battleRound.monstersDefeated,
        planetHealth: game.planetHealth,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    End battle round
 * @route   POST /api/games/:id/battle/end
 * @access  Private
 */
exports.endBattleRound = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Game is not in progress",
      });
    }


    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not in this game",
      });
    }


    if (getCurrentRoundIndex(game) !== 1) {
      return res.status(400).json({
        success: false,
        message: "Current round is not battle",
      });
    }


    game.rounds[1].completedAt = Date.now();


    if (game.rounds.length === 2) {
      game.rounds.push({
        type: "vote",
        startedAt: Date.now(),
      });
    }

    await game.save();

    res.status(200).json({
      success: true,
      data: {
        currentRound: getCurrentRoundIndex(game),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit vote for final round
 * @route   POST /api/games/:id/vote
 * @access  Private
 */
exports.submitVote = async (req, res, next) => {
  try {
    const { targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "Please provide targetId",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    if (game.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Game is not in progress",
      });
    }


    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not in this game",
      });
    }


    if (getCurrentRoundIndex(game) !== 2) {
      return res.status(400).json({
        success: false,
        message: "Current round is not voting",
      });
    }

    const voteRound = game.rounds[2];


    const alreadyVoted = voteRound.votes.some(
      (vote) => vote.voterId.toString() === req.user.id
    );

    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted",
      });
    }


    const targetExists = game.players.some(
      (player) => player.userId.toString() === targetId
    );

    if (!targetExists) {
      return res.status(400).json({
        success: false,
        message: "Target player not found in this game",
      });
    }


    voteRound.votes.push({
      voterId: req.user.id,
      targetId,
    });


    const allVoted = voteRound.votes.length === game.players.length;


    if (allVoted) {
      voteRound.completedAt = Date.now();
      game.completedAt = Date.now();
      game.status = "completed";


      const voteCounts = {};
      voteRound.votes.forEach((vote) => {
        const targetId = vote.targetId.toString();
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });


      let mostVotedPlayerId = null;
      let highestVotes = 0;

      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > highestVotes) {
          highestVotes = count;
          mostVotedPlayerId = playerId;
        }
      });


      const votedOutPlayer = game.players.find(
        (player) => player.userId.toString() === mostVotedPlayerId
      );

      const isImposterVotedOut =
        votedOutPlayer && votedOutPlayer.role === "imposter";


      if (isImposterVotedOut) {

        game.outcome = "team_win";
        game.planetHealth = 100; // Full recovery
      } else {

        game.outcome = "imposter_win";
        game.planetHealth = 0; // Planet falls
      }


      await calculateRewards(game);


      await updatePlayerStats(game);
    }

    await game.save();

    res.status(200).json({
      success: true,
      data: {
        allVoted,
        outcome: game.outcome,
      },
    });
  } catch (error) {
    next(error);
  }
};



/**
 * Assign roles to players in the game
 */
const assignRoles = async (game) => {
  const playerCount = game.players.length;


  let imposterCount = 1;
  if (playerCount >= 7) {
    imposterCount = 2;
  }


  const shuffledPlayers = [...game.players];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [
      shuffledPlayers[j],
      shuffledPlayers[i],
    ];
  }


  for (let i = 0; i < playerCount; i++) {
    const isImposter = i < imposterCount;
    game.players[i].role = isImposter ? "imposter" : "defender";
  }
};

/**
 * Set up game rounds
 */

const setupRounds = async (game) => {

  game.rounds = [];


  const playerIds = game.players.map((player) => player.userId);
  const players = await User.find({ _id: { $in: playerIds } });

  const interests = new Set();
  players.forEach((player) => {
    player.interests.forEach((interest) => interests.add(interest));
  });


  if (interests.size === 0) {
    interests.add("general");
  }


  let questions = await Question.aggregate([
    { $match: { category: { $in: Array.from(interests) } } },
    { $sample: { size: 10 } },
  ]);


  if (questions.length === 0) {
    questions = [
      {
        _id: "dummy1",
        text: "Which programming language was used to write the first version of Twitter?",
        options: ["Ruby on Rails", "PHP", "Python", "Java"],
        correctAnswer: 0,
      },
      {
        _id: "dummy2",
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Multi Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language",
        ],
        correctAnswer: 0,
      },
      {
        _id: "dummy3",
        text: "Which of these is NOT a JavaScript framework or library?",
        options: ["Angular", "React", "Django", "Vue"],
        correctAnswer: 2,
      },
    ];
  }


  game.rounds.push({
    type: "quiz",
    startedAt: Date.now(),
    questions: questions.map((q) => ({
      questionId: q._id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      playerAnswers: [],
    })),
  });

  console.log(
    `Game ${game._id} rounds initialized with ${game.rounds[0].questions.length} questions`
  );
};

/**
 * Get current round index
 */
const getCurrentRoundIndex = (game) => {
  if (game.status !== "in_progress") {
    return -1;
  }
  console.log("Total Rounds:", game.rounds.length);
  console.log("Game Status:", game.status);
  console.log("Total Rounds:", game.rounds.length);
  console.log("Game Rounds:", game.rounds);
  for (let i = 0; i < game.rounds.length; i++) {
    if (!game.rounds[i].completedAt) {
      return i;
    }
  }

  return -1;
};

/**
 * Calculate token rewards for players
 */
const calculateRewards = async (game) => {
  const playerRewards = {};


  for (const player of game.players) {
    let tokens = 50; // Participation reward


    if (
      (player.role === "defender" && game.outcome === "team_win") ||
      (player.role === "imposter" && game.outcome === "imposter_win")
    ) {
      tokens += 100; // Win bonus
    }


    tokens += player.score / 10;


    if (game.rounds[0]) {
      const correctAnswers = game.rounds[0].questions.filter((q) =>
        q.playerAnswers.some(
          (a) => a.userId.toString() === player.userId.toString() && a.isCorrect
        )
      ).length;

      tokens += correctAnswers * 5;
    }


    if (game.rounds[1]) {
      const monstersDefeated = game.rounds[1].playerActions.filter(
        (a) =>
          a.userId.toString() === player.userId.toString() &&
          a.action === "defeat"
      ).length;

      tokens += monstersDefeated * 2;
    }


    if (game.rounds[2] && game.outcome === "team_win") {
      const playerVote = game.rounds[2].votes.find(
        (v) => v.voterId.toString() === player.userId.toString()
      );

      if (playerVote) {
        const votedForImposter = game.players.some(
          (p) =>
            p.userId.toString() === playerVote.targetId.toString() &&
            p.role === "imposter"
        );

        if (votedForImposter) {
          tokens += 50; // Correct imposter identification
        }
      }
    }


    tokens = Math.round(tokens);


    player.tokensEarned = tokens;
    playerRewards[player.userId.toString()] = tokens;
  }

  return playerRewards;
};

/**
 * Update player stats based on game results
 */
const updatePlayerStats = async (game) => {
  for (const player of game.players) {
    const user = await User.findById(player.userId);

    if (user) {

      user.stats.gamesPlayed += 1;

      if (
        (player.role === "defender" && game.outcome === "team_win") ||
        (player.role === "imposter" && game.outcome === "imposter_win")
      ) {
        user.stats.gamesWon += 1;
      }


      if (game.rounds[0]) {
        const correctAnswers = game.rounds[0].questions.filter((q) =>
          q.playerAnswers.some(
            (a) =>
              a.userId.toString() === player.userId.toString() && a.isCorrect
          )
        ).length;

        user.stats.correctAnswers += correctAnswers;
      }


      if (game.rounds[1]) {
        const monstersDefeated = game.rounds[1].playerActions.filter(
          (a) =>
            a.userId.toString() === player.userId.toString() &&
            a.action === "defeat"
        ).length;

        user.stats.monstersDefeated += monstersDefeated;
      }


      if (
        game.rounds[2] &&
        player.role === "defender" &&
        game.outcome === "team_win"
      ) {
        const playerVote = game.rounds[2].votes.find(
          (v) => v.voterId.toString() === player.userId.toString()
        );

        if (playerVote) {
          const votedForImposter = game.players.some(
            (p) =>
              p.userId.toString() === playerVote.targetId.toString() &&
              p.role === "imposter"
          );

          if (votedForImposter) {
            user.stats.correctImpostersIdentified += 1;
          }
        }
      }


      user.stats.tokensEarned += player.tokensEarned;

      await user.save();
    }
  }
};
