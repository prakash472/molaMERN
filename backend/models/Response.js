const mongoose = require("mongoose");

const ResponseSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  questionResponse: [
    {
      question: String,
      answers: String,
      responseTime: Number,
    },
  ],
});
module.exports = mongoose.model("Responses", ResponseSchema);
