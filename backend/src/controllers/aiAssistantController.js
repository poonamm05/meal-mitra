import { askAiAssistant } from '../services/aiService.js';
import AIConversation from '../models/AIConversation.js';
import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

export const sendAiMessage = async (req, res) => {
  try {
    const { message, sessionId = 'default_session' } = req.body;
    const userId = req.user?._id || null;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    let conversation = null;
    if (userId) {
      conversation = await AIConversation.findOne({ user: userId });
    } else {
      conversation = await AIConversation.findOne({ sessionId });
    }

    if (!conversation) {
      conversation = new AIConversation({
        user: userId,
        sessionId,
        title: 'Meal Companion Chat',
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResult = await askAiAssistant({
      message,
      conversationHistory: conversation.messages,
      userProfile: req.user || {},
    });

    // Populate suggested recipe objects if any
    let populatedDishes = [];
    if (aiResult.suggestedRecipes && aiResult.suggestedRecipes.length > 0) {
      try {
        populatedDishes = await Recipe.find({
          $or: [
            { _id: { $in: aiResult.suggestedRecipes } },
            { name: { $in: aiResult.suggestedRecipes } },
          ],
        });
      } catch (e) {
        populatedDishes = sampleRecipes.slice(0, 3);
      }
    }

    if (populatedDishes.length === 0) {
      // Pick 2 contextual sample recipes
      populatedDishes = sampleRecipes.slice(0, 2);
    }

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: aiResult.text,
      suggestedRecipes: populatedDishes.map((d) => d._id || d.name),
      timestamp: new Date(),
    });

    await conversation.save();

    res.json({
      success: true,
      data: {
        reply: aiResult.text,
        suggestedDishes: populatedDishes,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { sessionId = 'default_session' } = req.query;

    let conversation = null;
    if (userId) {
      conversation = await AIConversation.findOne({ user: userId }).populate('messages.suggestedRecipes');
    } else {
      conversation = await AIConversation.findOne({ sessionId }).populate('messages.suggestedRecipes');
    }

    if (!conversation) {
      return res.json({
        success: true,
        data: {
          messages: [
            {
              role: 'assistant',
              content: `Namaste! 👋 I'm **MealMitra AI**, your personal cooking companion.\n\nI can help you solve the daily question: **“What should I cook today?”**\n\nTry asking me:\n• *"I have potatoes, onions and tomatoes. What can I make?"*\n• *"Suggest a healthy high-protein dinner under 30 minutes."*\n• *"What can I cook for 4 people under ₹200?"*\n• *"I don't want paneer today, give me alternatives."*`,
              timestamp: new Date(),
            },
          ],
        },
      });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearConversation = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { sessionId = 'default_session' } = req.body;

    if (userId) {
      await AIConversation.deleteOne({ user: userId });
    } else {
      await AIConversation.deleteOne({ sessionId });
    }

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
