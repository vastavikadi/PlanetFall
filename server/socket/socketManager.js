const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');

module.exports = (io) => {

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication failed: No token provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication failed: User not found'));
      }
      
      socket.user = {
        id: user._id,
        username: user.username
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication failed: Invalid token'));
    }
  });
  

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    

    socket.on('join_game', async ({ gameId }) => {
      try {

        const game = await Game.findById(gameId)
          .populate('creatorId', 'username')
          .populate('players.userId', 'username');
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        

        const playerInGame = game.players.some(
          player => player.userId._id.toString() === socket.user.id
        );
        
        if (!playerInGame) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        

        socket.join(game.roomId);
        

        socket.to(game.roomId).emit('player_joined', {
          id: socket.user.id,
          username: socket.user.username
        });
        

        const playerRole = game.players.find(
          player => player.userId._id.toString() === socket.user.id
        )?.role;
        
        socket.emit('game_state', {
          id: game._id,
          roomId: game.roomId,
          gameMode: game.gameMode,
          status: game.status,
          planetHealth: game.planetHealth,
          currentRound: getCurrentRoundIndex(game),
          role: playerRole,
          players: game.players.map(player => ({
            id: player.userId._id,
            username: player.userId.username,
            score: player.score
          }))
        });
      } catch (error) {
        console.error('Error joining game room:', error);
        socket.emit('error', { message: 'Failed to join game room' });
      }
    });
    

    socket.on('leave_game', ({ gameId }) => {
      socket.leave(gameId);
      

      socket.to(gameId).emit('player_left', {
        id: socket.user.id,
        username: socket.user.username
      });
    });
    

    socket.on('submit_answer', async ({ gameId, questionIndex, answerIndex }) => {
      try {
        console.log("Received event with data:", { gameId, questionIndex, answerIndex });

        const game = await Game.findById(gameId);
        
        if (!game) {
          console.log("no game");
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        console.log("Socket user ID:", socket.user?.id);

        const playerIndex = game.players.findIndex(
          player => player.userId.toString() === String(socket.user.id)
        );        
        
        if (playerIndex === -1) {
          console.log("not in this game");
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        

        if (getCurrentRoundIndex(game) !== 0) {
          console.log("not current round");
          socket.emit('error', { message: 'Current round is not quiz' });
          return;
        }
        
        const quizRound = game.rounds[0];
        

        if (!quizRound.questions[questionIndex]) {
          console.log("question not found");
          socket.emit('error', { message: 'Question not found' });
          return;
        }
        

        const alreadyAnswered = quizRound.questions[questionIndex].playerAnswers.some(
          answer => answer.userId.toString() === socket.user.id
        );
        
        if (alreadyAnswered) {
          console.log("already answered");
          socket.emit('error', { message: 'You have already answered this question' });
          return;
        }
        

        const isCorrect = answerIndex === quizRound.questions[questionIndex].correctAnswer;
        

        quizRound.questions[questionIndex].playerAnswers.push({
          userId: socket.user.id,
          answerIndex,
          isCorrect
        });
        

        if (isCorrect) {
          game.players[playerIndex].score += 10;
          

          if (game.players[playerIndex].role !== 'imposter') {
            game.planetHealth = Math.min(100, game.planetHealth + 5);
          }
        } else {

          game.planetHealth = Math.max(0, game.planetHealth - 3);
        }
        

        const allAnswered = quizRound.questions.every(question => 
          question.playerAnswers.length === game.players.length
        );
        

        if (allAnswered) {
          quizRound.completedAt = Date.now();
          

          if (game.rounds.length === 1) {
            game.rounds.push({
              type: 'battle',
              startedAt: Date.now()
            });
          }
          

          io.to(game.roomId).emit('round_change', {
            roundIndex: 1,
            planetHealth: game.planetHealth
          });
        }
        
        try {
          await game.save();
          console.log("Game updated successfully:", game);
        } catch (err) {
          console.error("Error saving game:", err);
          socket.emit("error", { message: "Failed to save game update" });
        }
        
        

        io.to(game.roomId).emit('player_answered', {
          playerId: socket.user.id,
          questionIndex,
          isCorrect,
          planetHealth: game.planetHealth
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });
    

    socket.on('attack_monster', async ({ gameId, monsterId }) => {
      try {
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        

        const playerIndex = game.players.findIndex(
          player => player.userId.toString() === socket.user.id
        );
        
        if (playerIndex === -1) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        

        if (getCurrentRoundIndex(game) !== 1) {
          socket.emit('error', { message: 'Current round is not battle' });
          return;
        }
        
        const battleRound = game.rounds[1];
        

        battleRound.playerActions.push({
          userId: socket.user.id,
          action: 'defeat',
          targetId: monsterId
        });
        

        battleRound.monstersDefeated += 1;
        

        game.players[playerIndex].score += 20;
        

        if (game.players[playerIndex].role !== 'imposter') {
          game.planetHealth = Math.min(100, game.planetHealth + 3);
        }
        try {
          await game.save();
          console.log("Game updated successfully:", game);
        } catch (err) {
          console.error("Error saving game:", err);
          socket.emit("error", { message: "Failed to save game update" });
        }
        

        io.to(game.roomId).emit('monster_defeated', {
          playerId: socket.user.id,
          monsterId,
          monstersDefeated: battleRound.monstersDefeated,
          planetHealth: game.planetHealth
        });
      } catch (error) {
        console.error('Error attacking monster:', error);
        socket.emit('error', { message: 'Failed to attack monster' });
      }
    });
    

    socket.on('submit_vote', async ({ gameId, targetId }) => {
      try {
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        

        const playerIndex = game.players.findIndex(
          player => player.userId.toString() === socket.user.id
        );
        
        if (playerIndex === -1) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        

        if (getCurrentRoundIndex(game) !== 2) {
          socket.emit('error', { message: 'Current round is not voting' });
          return;
        }
        
        const voteRound = game.rounds[2];
        

        const alreadyVoted = voteRound.votes.some(
          vote => vote.voterId.toString() === socket.user.id
        );
        
        if (alreadyVoted) {
          socket.emit('error', { message: 'You have already voted' });
          return;
        }
        

        const targetExists = game.players.some(
          player => player.userId.toString() === targetId
        );
        
        if (!targetExists) {
          socket.emit('error', { message: 'Target player not found in this game' });
          return;
        }
        

        voteRound.votes.push({
          voterId: socket.user.id,
          targetId
        });
        

        const allVoted = voteRound.votes.length === game.players.length;
        

        if (allVoted) {
          voteRound.completedAt = Date.now();
          game.completedAt = Date.now();
          game.status = 'completed';
          

          const voteCounts = {};
          voteRound.votes.forEach(vote => {
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
            player => player.userId.toString() === mostVotedPlayerId
          );
          
          const isImposterVotedOut = votedOutPlayer && votedOutPlayer.role === 'imposter';
          

          if (isImposterVotedOut) {

            game.outcome = 'team_win';
            game.planetHealth = 100; // Full recovery
          } else {

            game.outcome = 'imposter_win';
            game.planetHealth = 0; // Planet falls
          }
          

          const playerRewards = await calculateRewards(game);
          

          await updatePlayerStats(game);
          

          io.to(game.roomId).emit('game_ended', {
            outcome: game.outcome,
            planetHealth: game.planetHealth,
            votedOutPlayer: mostVotedPlayerId,
            isImposterVotedOut,
            playerRewards
          });
        }
        
        await game.save();
        

        io.to(game.roomId).emit('vote_submitted', {
          voterId: socket.user.id,
          targetId,
          allVoted
        });
      } catch (error) {
        console.error('Error submitting vote:', error);
        socket.emit('error', { message: 'Failed to submit vote' });
      }
    });
    

    socket.on('spawn_monster', ({ gameId }) => {

      const monsterId = `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      

      const monster = {
        id: monsterId,
        health: 100,
        size: Math.floor(Math.random() * 40) + 40, // 40-80
        position: {
          x: Math.floor(Math.random() * 80) + 10, // 10-90%
          y: Math.floor(Math.random() * 80) + 10  // 10-90%
        }
      };
      

      io.to(gameId).emit('monster_spawned', monster);
    });
    

    socket.on('player_presence', ({ gameId, present }) => {

      socket.to(gameId).emit('player_presence_update', {
        playerId: socket.user.id,
        present
      });
    });
    

    socket.on('chat_message', ({ gameId, message }) => {

      io.to(gameId).emit('chat_message', {
        playerId: socket.user.id,
        playerName: socket.user.username,
        message,
        timestamp: Date.now()
      });
    });
    

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
  

  
  /**
   * Get current round index
   */
  const getCurrentRoundIndex = (game) => {
    if (game.status !== 'in_progress') {
      return -1;
    }
    
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
      

      if ((player.role === 'defender' && game.outcome === 'team_win') ||
          (player.role === 'imposter' && game.outcome === 'imposter_win')) {
        tokens += 100; // Win bonus
      }
      

      tokens += player.score / 10;
      

      if (game.rounds[0]) {
        const correctAnswers = game.rounds[0].questions.filter(q => 
          q.playerAnswers.some(a => 
            a.userId.toString() === player.userId.toString() && a.isCorrect
          )
        ).length;
        
        tokens += correctAnswers * 5;
      }
      

      if (game.rounds[1]) {
        const monstersDefeated = game.rounds[1].playerActions.filter(a => 
          a.userId.toString() === player.userId.toString() && a.action === 'defeat'
        ).length;
        
        tokens += monstersDefeated * 2;
      }
      

      if (game.rounds[2] && game.outcome === 'team_win') {
        const playerVote = game.rounds[2].votes.find(v => 
          v.voterId.toString() === player.userId.toString()
        );
        
        if (playerVote) {
          const votedForImposter = game.players.some(p => 
            p.userId.toString() === playerVote.targetId.toString() && p.role === 'imposter'
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
        
        if ((player.role === 'defender' && game.outcome === 'team_win') ||
            (player.role === 'imposter' && game.outcome === 'imposter_win')) {
          user.stats.gamesWon += 1;
        }
        

        if (game.rounds[0]) {
          const correctAnswers = game.rounds[0].questions.filter(q => 
            q.playerAnswers.some(a => 
              a.userId.toString() === player.userId.toString() && a.isCorrect
            )
          ).length;
          
          user.stats.correctAnswers += correctAnswers;
        }
        

        if (game.rounds[1]) {
          const monstersDefeated = game.rounds[1].playerActions.filter(a => 
            a.userId.toString() === player.userId.toString() && a.action === 'defeat'
          ).length;
          
          user.stats.monstersDefeated += monstersDefeated;
        }
        

        if (game.rounds[2] && player.role === 'defender' && game.outcome === 'team_win') {
          const playerVote = game.rounds[2].votes.find(v => 
            v.voterId.toString() === player.userId.toString()
          );
          
          if (playerVote) {
            const votedForImposter = game.players.some(p => 
              p.userId.toString() === playerVote.targetId.toString() && p.role === 'imposter'
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
};