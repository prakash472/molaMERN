const express = require("express");
const router = express.Router();
const Question = require(`../models/Response`);

router.get("/get-random-questions", async (req, res) => {
  const csvFilePath = "mola.csv";
  const randomIndex = new Set();
  const csv = require("csvtojson");
  const jsonArray = await csv().fromFile(csvFilePath);
  var cleanedArray = [];
  jsonArray.map((singleObject) => {
    var question = singleObject.questiontext;
    let answers = [];
    var answer_keys = Object.keys(singleObject);
    for (let i = 0; i < answer_keys.length; i++) {
      if (answer_keys[i].startsWith("option")) {
        answers.push(singleObject[`${answer_keys[i]}`]);
      }
    }
    cleanedArray.push({ question: question, answers: answers });
  });
  let finalQuestions = [];
  while (finalQuestions.length !== 10) {
    var index = Math.floor(Math.random() * cleanedArray.length);
    if (randomIndex.has(index)) {
      continue;
    } else {
      randomIndex.add(index);
      finalQuestions.push(cleanedArray[index]);
    }
  }
  res.json({ data: finalQuestions });
});

router.post("/save-responses", async (req, res) => {
  console.log("Hit the save-respobse", req.body);
  const questionResponses = new Question({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    questionResponse: req.body.response,
  });
  try {
    const createdResponse = await questionResponses.save();
    res.json({ message: "Succsessfully Stored Data" });
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/get-all-responses", async (req, res) => {
  try {
    const responses = await Question.find();
    const finalResponse = [];
    responses.map((singleObject) => {
      let singleResponse = {};
      singleResponse["firstName"] = singleObject.firstName;
      singleResponse["lastName"] = singleObject.lastName;
      singleResponse["email"] = singleObject.email;
      let singlResponseQuestion = [];
      singleObject.questionResponse.map((question) => {
        let singleQuestion = {};
        singleQuestion["question"] = question.question;
        singleQuestion["answers"] = question.answers;
        singleQuestion["responseTime"] = question.responseTime;
        singlResponseQuestion.push(singleQuestion);
      });
      singleResponse["questionResponse"] = singlResponseQuestion;
      finalResponse.push(singleResponse);
    });
    res.json(finalResponse);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
