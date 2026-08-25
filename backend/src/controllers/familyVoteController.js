import FamilyVote from '../models/FamilyVote.js';
import Recipe from '../models/Recipe.js';

const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createFamilyVote = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { title, mealType = 'dinner', recipeIds = [] } = req.body;

    if (!recipeIds || recipeIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Please select at least 2 meal options to vote on' });
    }

    const shareCode = generateShareCode();

    const options = recipeIds.map((rId) => ({
      recipe: rId,
      votes: [],
    }));

    const poll = await FamilyVote.create({
      creator: creatorId,
      title: title || 'What should we cook for dinner?',
      mealType,
      shareCode,
      options,
      isActive: true,
    });

    const populated = await FamilyVote.findById(poll._id).populate('options.recipe');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVoteByShareCode = async (req, res) => {
  try {
    const { shareCode } = req.params;
    const poll = await FamilyVote.findOne({ shareCode: shareCode.toUpperCase() })
      .populate('creator', 'name')
      .populate('options.recipe')
      .populate('winningRecipe');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Voting poll not found' });
    }

    // Calculate total votes and identify leader
    let totalVotes = 0;
    let leadingOption = null;
    let maxVotes = -1;

    const optionsWithCounts = poll.options.map((opt) => {
      const voteCount = (opt.votes || []).length;
      totalVotes += voteCount;
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        leadingOption = opt.recipe;
      }
      return {
        _id: opt._id,
        recipe: opt.recipe,
        customTitle: opt.customTitle,
        voteCount,
        voters: opt.votes.map((v) => ({ name: v.voterName, comment: v.comment, timestamp: v.votedAt })),
      };
    });

    res.json({
      success: true,
      data: {
        _id: poll._id,
        title: poll.title,
        mealType: poll.mealType,
        shareCode: poll.shareCode,
        creator: poll.creator,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        winningRecipe: poll.winningRecipe || (totalVotes > 0 ? leadingOption : null),
        totalVotes,
        options: optionsWithCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { optionId, voterName, comment = '' } = req.body;

    if (!voterName || !optionId) {
      return res.status(400).json({ success: false, message: 'Voter name and option selection are required' });
    }

    const poll = await FamilyVote.findOne({ shareCode: shareCode.toUpperCase() });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ success: false, message: 'This poll is already closed' });
    }

    // Remove any previous vote by this voter across options to allow changing vote
    poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((v) => v.voterName.toLowerCase() !== voterName.trim().toLowerCase());
    });

    // Add new vote to chosen option
    const targetOption = poll.options.id(optionId);
    if (!targetOption) {
      return res.status(400).json({ success: false, message: 'Invalid option selected' });
    }

    targetOption.votes.push({
      voterName: voterName.trim(),
      user: req.user?._id || null,
      comment: comment.trim(),
      votedAt: new Date(),
    });

    await poll.save();

    res.json({ success: true, message: 'Vote recorded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPolls = async (req, res) => {
  try {
    const userId = req.user._id;
    const polls = await FamilyVote.find({ creator: userId })
      .populate('options.recipe')
      .populate('winningRecipe')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: polls.length, data: polls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await FamilyVote.findOne({ _id: id, creator: req.user._id });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found or unauthorized' });
    }

    // Find winner
    let topRecipe = null;
    let highestCount = -1;
    poll.options.forEach((opt) => {
      const c = (opt.votes || []).length;
      if (c > highestCount) {
        highestCount = c;
        topRecipe = opt.recipe;
      }
    });

    poll.isActive = false;
    poll.winningRecipe = topRecipe;
    await poll.save();

    res.json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
