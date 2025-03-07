// controllers/valuePropositionController.js
const axios = require("axios");
const ValueProposition = require("../model/ValueProposition");

const generateValueProposition = async (req, res) => {
  const { targetMarket, keyProblem, solution, outcome } = req.body;
  const email = "ai.studio.projects@gmail.com";

  const ppmt = `Instruction for Processing Student Inputs into a Value Proposition:
Using the student’s answers to the following questions:
Who is their specific target market?
What is the key problem their target market struggles with?
What solution do they provide to solve this problem?
What measurable outcome or transformation can their target market expect?
Generate the following outputs:
Value Proposition Statement:
Craft a one-sentence value proposition using this format:
"I help [specific group] who are struggling with [specific challenge] by providing [specific solution or outcome]."
Ensure the statement is clear, concise, and directly reflects the student’s responses.
Refinement Suggestions:
If necessary, offer suggestions to improve clarity or specificity in the statement.
Suggest ways to make the value proposition more impactful or differentiated from competitors.
Feedback & Testing Plan:
Recommend simple strategies for the student to test their value proposition, such as sharing it in relevant forums, asking for feedback from their target audience, or including it in their marketing materials.
Provide 2-3 example questions they can ask their network or potential clients to validate the strength of the statement.
Output Format:
Initial Value Proposition: [Insert here]
Refinement Suggestions: [Insert here]
Feedback & Testing Plan: [Insert here]`;

  const prompt = [
    {
      role: "system",
      content: "You are a helpful assistant that generates value proposition statements and suggestions. Please give your response in markdown format.",
    },
    {
      role: "user",
      content: `The user qns answers are : Who is their specific target market? ${targetMarket} 
                What is the key problem their target market struggles with? ${keyProblem}
                What solution do they provide to solve this problem? ${solution}
                What measurable outcome or transformation can their target market expect? ${outcome} and use this prompt to generate response ${ppmt}`,
    },
  ];

  try {
    // OpenAI Chat Completion API with streaming enabled
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: prompt,
        stream: true, // Enable streaming
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream", // Enable streaming
      }
    );

    let openaiResponse = ""; // To store the full response

    // Stream processing
    const openaiStream = response.data;
    openaiStream.on("data", (chunk) => {
      const lines = chunk.toString().split("\n").filter((line) => line.trim() !== "");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const jsonString = line.replace(/^data: /, "").trim();
          if (jsonString === "[DONE]") {
            // End of stream
            return;
          }

          try {
            const parsedData = JSON.parse(jsonString);
            if (parsedData.choices && parsedData.choices[0].delta && parsedData.choices[0].delta.content) {
              openaiResponse += parsedData.choices[0].delta.content; // Append content
            }
          } catch (err) {
            console.error("Error parsing stream chunk:", err);
          }
        }
      }

      // Optionally send partial responses back to frontend in real-time
      res.write(chunk.toString());
    });

    openaiStream.on("end", async () => {
      res.end(); // Close the stream once done

      try {
        let existingRecord = await ValueProposition.findOne({ email });

        if (existingRecord) {
          // Update existing record
          existingRecord.targetMarket = targetMarket;
          existingRecord.keyProblem = keyProblem;
          existingRecord.solution = solution;
          existingRecord.outcome = outcome;
          existingRecord.openaiResponse = openaiResponse; // Save full response
          await existingRecord.save();
        } else {
          // Create a new record
          const newValueProposition = new ValueProposition({
            targetMarket,
            keyProblem,
            solution,
            outcome,
            openaiResponse,
            email,
          });
          await newValueProposition.save();
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json({ error: "Error saving data to database." });
      }
    });

    openaiStream.on("error", (err) => {
      console.error("Error during streaming:", err);
      res.status(500).json({ error: "Error generating value proposition." });
    });
  } catch (error) {
    console.error("Error generating value proposition:", error);
    res.status(500).json({ error: "Error generating value proposition." });
  }
};

module.exports = { generateValueProposition };
