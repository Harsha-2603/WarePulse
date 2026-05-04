import * as aiService from '../services/aiService.js';

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const shopId = req.user?.shop_id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    if (!shopId) {
      return res.status(401).json({ success: false, message: "Shop identification required" });
    }

    const reply = await aiService.getGroqChatCompletion(message, shopId);

    // Exact response structure requested by frontend requirements
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Assistant Error (Controller):", error.message || error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate AI response" });
  }
};
