import { askAI } from "../services/openaiService.js";
import { assistantPrompt } from "../prompts/assistantPrompt.js";

export async function chat(req, res) {

  try {

    const { message } = req.body;

    const reply = await askAI(
      assistantPrompt(message)
    );

    res.json({
      success: true,
      reply
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

}