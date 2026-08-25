import mongoose from 'mongoose';

const voterRecordSchema = new mongoose.Schema(
  {
    voterName: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, default: '' },
    votedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voteOptionSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    customTitle: { type: String },
    notes: { type: String },
    votes: [voterRecordSchema],
  },
  { _id: true }
);

const familyVoteSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'What should we eat for dinner tonight?',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'weekend_special'],
      default: 'dinner',
    },
    shareCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    options: [voteOptionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    winningRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours from creation
    },
  },
  {
    timestamps: true,
  }
);

const FamilyVote = mongoose.model('FamilyVote', familyVoteSchema);
export default FamilyVote;
