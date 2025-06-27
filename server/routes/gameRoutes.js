const express = require('express');
const { 
  createGame,
  joinGame,
  leaveGame,
  startGame,
  getGames,
  getGameHistory,
  getGame,
  submitAnswer,
  defeatMonster,
  endBattleRound,
  submitVote
} = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.use(protect);


router.post('/', createGame);
router.get('/', getGames);
router.get('/history', getGameHistory);
router.get('/:id', getGame);


router.post('/:id/join', joinGame);
router.post('/:id/leave', leaveGame);
router.post('/:id/start', startGame);
router.post('/:id/answer', submitAnswer);
router.post('/:id/monster', defeatMonster);
router.post('/:id/battle/end', endBattleRound);
router.post('/:id/vote', submitVote);

module.exports = router;