const express = require("express");
const User = require("../models/User");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
router.get("/", protect, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
router.get("/:id", protect, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
router.put("/:id", protect, isAdmin, async (req, res, next) => {
  try {
    const { username, email, roles, interests } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (roles) updateData.roles = roles;
    if (interests) updateData.interests = interests;


    user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
router.delete("/:id", protect, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats/leaderboard
 * @access  Public
 */
router.get("/stats/leaderboard", async (req, res, next) => {
  try {
    const leaderboard = await User.find()
      .select("username stats")
      .sort({ "stats.gamesWon": -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get current user's friends
 * @route   GET /api/users/friends
 * @access  Private
 */
router.get("/friends", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.friends || [],
    });
  } catch (error) {
    next(error);
  }
});



/**
 * @desc    Add a friend
 * @route   POST /api/users/friends/:userId
 * @access  Private
 */
router.post("/friends/:userId", protect, async (req, res, next) => {
  try {

    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend",
      });
    }


    const friendUser = await User.findById(req.params.userId);

    if (!friendUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const user = await User.findById(req.user.id);


    if (user.friends && user.friends.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user",
      });
    }


    if (!user.friends) {
      user.friends = [];
    }
    user.friends.push(req.params.userId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Friend added successfully",
      data: user.friends,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Remove a friend
 * @route   DELETE /api/users/friends/:userId
 * @access  Private
 */
router.delete("/friends/:userId", protect, async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);


    if (!user.friends || !user.friends.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "Not friends with this user",
      });
    }


    user.friends = user.friends.filter(
      (friendId) => friendId.toString() !== req.params.userId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
      data: user.friends,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
