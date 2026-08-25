import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    suggestedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    metadata: {
      detectedIngredients: [String],
      detectedMealType: String,
      budgetMax: Number,
      prepTimeMax: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      default: 'Meal Advice & Ideas',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
