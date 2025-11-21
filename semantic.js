// semantic.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow images

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  try {
    const { base64, mimeType, filename } = req.body;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this image: ${filename}` },
            { type: "input_image", image_url: `data:${mimeType};base64,${base64}` }
          ]
        }
      ]
    });

    const text = response.output_text;

    res.json({
      summary: text,
      tags: extractTags(text),
      confidence: 0.98
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

function extractTags(str) {
  return str
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g)
    ?.slice(0, 8) || [];
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Semantic server running on " + PORT));
