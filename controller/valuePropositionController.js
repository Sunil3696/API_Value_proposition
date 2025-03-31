// controllers/valuePropositionController.js
const axios = require("axios");
const ValueProposition = require("../model/ValueProposition");

const generateValueProposition = async (req, res) => {
  const { qaPairs } = req.body; 
  const email = req.user.email;


  try {
    // 1. Format Q&A for GPT
    const formattedQA = qaPairs.map((pair, index) => 
      `Q${index + 1}: ${pair.question}\nA${index + 1}: ${pair.answer}`
    ).join('\n\n');


    const prompt = [
      {
        role: "system",
        content: "You're a business strategist. Format response in markdown with these exact headers:"
      },
      {
        role: "user",
        content: `The user question and asnwers are: ${formattedQA}  and use this prompt and Use the students answers, generate the following outputs:
Value Proposition Statement:
Craft a one-sentence value proposition using this format:
"I help [specific group] who are struggling with [specific challenge] by providing [specific solution or outcome]."
Ensure the statement is clear, concise, and directly reflects the student’s responses.
Refinement Suggestions:
If necessary, offer suggestions to improve clarity or specificity in the statement.
Suggest ways to make the value proposition more impactful or differentiated from competitors.
Feedback & Testing Plan:
Recommend simple strategies for the student to test their value proposition, such as sharing it in relevant forums, asking for feedback from their target audience, or including it in their marketing materials.
Provide 2-3 example questions they can ask their network or potential clients to validate the strength of the statement. add proper line breaking in markdown and response please
`
      }
    ];
console.log(prompt)
    // 3. API call
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: prompt,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    // console.log(response.data.choices[0].message.content)c

    // 4. Save raw Q&A + response
    await ValueProposition.findOneAndUpdate(
      { email },
      { qaPairs, answer: response.data.choices[0].message.content },
      { upsert: true }
    );

    const updatedDoc = await ValueProposition.findOneAndUpdate(
      { email },
      {
        qaPairs,
        gptResponse: response.data.choices[0].message.content,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ answer: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate proposition" });
  }
};



const getUserData = async (req, res) => {
  const email = req.user.email;

  try {
    const userData = await ValueProposition.findOne({ email });
    if (userData) {
      res.json(userData);
    } else {
      res.status(404).json({ message: "User data not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

const deleteUserData = async (req, res) => {
  const email = req.user.email;

  try {
    const result = await ValueProposition.updateOne(
      { email: email },
      { $unset: { gptResponse: "" } } 
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "User data reset successfully" });
    } else {
      res.status(404).json({ message: "User data not found" });
    }
  } catch (error) {
    console.error("Error resetting user data:", error);
    res.status(500).json({ error: "Failed to reset user data" });
  }
};


module.exports = { generateValueProposition ,getUserData, deleteUserData};
