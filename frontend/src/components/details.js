import React, { useState, useEffect } from "react";
import axios from "../axios";
import "./details.css";
import { CSVLink } from "react-csv";

export const Details = () => {
  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    response: [],
  };
  const [form, setForm] = useState(initialFormState);
  const [isStarted, setIsStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [finished, setIsFinished] = useState(false);
  const [startTime, setStartedTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  const [questionNumberForTimer, setQuestionNumberForTimer] = useState(0);
  const [questionTime, setQuestionTime] = useState({});
  const [submitResponseReady, setIssubmitResponseReady] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previousRecord, setPreviousRecord] = useState(false);
  const [allResponses, setAllResponses] = useState([]);
  const [isDownloadCSVButtonAvailable, setIsDownloadCSVButtonAvailable] =
    useState(false);
  const {
    Parser,
    transforms: { unwind },
  } = require("json2csv");

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Question",
    "Answer",
    "Response Time",
  ];
  const [csvlink, setCSVLink] = useState({});
  useEffect(() => {
    async function fetchQuestion() {
      let response = await axios
        .get("response/get-random-questions")
        .then((res) => res.data);
      setQuestions(response.data);
    }
    fetchQuestion();
  }, []);

  useEffect(() => {
    setForm(form);
  }, [form]);
  useEffect(() => {}, [startTime]);

  useEffect(() => {
    var time_difference = endTime - startTime;
    if (questionNumberForTimer !== 0) {
      if (questionNumberForTimer in questionTime) {
        questionTime[questionNumberForTimer] += time_difference;
        setQuestionTime(questionTime);
      } else {
        questionTime[questionNumberForTimer] = time_difference;
        setQuestionTime(questionTime);
      }
    }
    if (questionNumberForTimer === 10) {
      var finalResponseDestructed = [...form.response];
      var finalFormsDestructed = { ...form };

      finalResponseDestructed.map((response, index) => {
        return (response.responseTime = questionTime[index + 1]);
      });
      setForm({ ...finalFormsDestructed, response: finalResponseDestructed });
      setIssubmitResponseReady(true);
    }
    setStartedTime(Date.now());
  }, [endTime]);

  useEffect(() => {
    async function submitResponse() {
      console.log("Right before submitting", form);
      let response = await axios
        .post("response/save-responses", JSON.stringify(form))
        .then((res) => {
          if (res.status === 200) {
            setIsSubmitted(true);
          }
        });
      setPreviousRecord(true);
    }
    if (form.response.length == 10 && questionNumberForTimer === 10) {
      submitResponse();
    }
  }, [submitResponseReady]);

  useEffect(() => {
    async function getAllResponses() {
      let allResponse = await axios
        .get("response/get-all-responses")
        .then((res) => res.data);
      setAllResponses(allResponse);
      const fields = [
        "firstName",
        "lastName",
        "email",
        "questionResponse.question",
        "questionResponse.answers",
        "questionResponse.responseTime",
      ];
      const transforms = [unwind({ paths: ["questionResponse"] })];
      const json2csvParser = new Parser({ fields, transforms });

      const csv = json2csvParser.parse(allResponse);
      var lines = csv.split("\n");
      lines.splice(0, 1);
      var newcsv = lines.join("\n");
      const csvlink = {
        filename: "response.csv",
        headers: headers,
        data: newcsv,
      };
      setCSVLink(csvlink);
      setIsDownloadCSVButtonAvailable(true);
    }
    if (previousRecord === true) {
      getAllResponses();
    }
  }, [previousRecord]);
  const handleStartedClick = (event) => {
    event.preventDefault();
    setIsStarted(true);
    setQuestionNumber(questionNumber + 1);
    setStartedTime(Date.now());
  };

  const handlePreviousClick = (event) => {
    event.preventDefault();
    if (questionNumber === 1) {
      setIsStarted(false);
    }
    if (questionNumber === 10) {
      setIsFinished(false);
    }
    if (form.response.length <= questionNumber - 1) {
      var responseDestructed = [...form.response];
      var formsDestructred = { ...form };
      responseDestructed.push({ question: "", answers: "", responseTime: 0 });
      setForm({ ...formsDestructred, response: responseDestructed });
    }
    setQuestionNumberForTimer(questionNumber);
    setQuestionNumber(questionNumber - 1);
    setEndTime(Date.now());
  };
  const handleNextClick = (event) => {
    event.preventDefault();
    if (questionNumber === 10) {
      setIsFinished(true);
    }
    if (form.response.length <= questionNumber - 1) {
      var responseDestructed = [...form.response];
      var formsDestructred = { ...form };
      responseDestructed.push({ question: "", answers: "", responseTime: 0 });
      setForm({ ...formsDestructred, response: responseDestructed });
    }
    setQuestionNumberForTimer(questionNumber);
    setEndTime(Date.now());
    setQuestionNumber(questionNumber + 1);
  };

  const handleRadioButtonClicked = (event) => {
    var questionResponse = event.target.name;
    var answerResponse = event.target.value;
    if (form.response.length > questionNumber - 1) {
      var responseDestructed = [...form.response];
      var formsDestructred = { ...form };
      responseDestructed[questionNumber - 1] = {
        question: questionResponse,
        answers: answerResponse,
        responseTime: 0,
      };
      setForm({ ...formsDestructred, response: responseDestructed });
    } else {
      var responseDestructed = [...form.response];
      var formsDestructred = { ...form };
      responseDestructed.push({
        question: questionResponse,
        answers: answerResponse,
        responseTime: 0,
      });
      setForm({ ...formsDestructred, response: responseDestructed });
    }
  };
  return (
    <>
      <div className="parent">
        <div className="create">
          {!isStarted && (
            <form>
              <h2>Let's get Started</h2>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <button onClick={(event) => handleStartedClick(event)}>
                Continue
              </button>
            </form>
          )}
          {isStarted && !finished && (
            <form>
              <h2>Question {questionNumber}</h2>
              <h3>{questions[questionNumber - 1].question}</h3>

              {questions[questionNumber - 1].answers.map((option, idx) => {
                return (
                  <div className="radio-options" key={idx}>
                    {form.response.length <= questionNumber - 1 && (
                      <input
                        type="radio"
                        name={questions[questionNumber - 1].question}
                        value={option}
                        onChange={handleRadioButtonClicked}
                      />
                    )}
                    {form.response.length > questionNumber - 1 && (
                      <input
                        type="radio"
                        name={questions[questionNumber - 1].question}
                        value={option}
                        checked={
                          form.response[questionNumber - 1].answers === option
                        }
                        onChange={handleRadioButtonClicked}
                      />
                    )}
                    <label> {option}</label>
                  </div>
                );
              })}
              <div className="question-buttons">
                <button onClick={(event) => handlePreviousClick(event)}>
                  Previous
                </button>
                {questionNumber < 10 ? (
                  <button onClick={(event) => handleNextClick(event)}>
                    Next
                  </button>
                ) : (
                  <button onClick={(event) => handleNextClick(event)}>
                    Submit Response
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      {finished && (
        <div className="final-page">
          {isSubmitted ? (
            <h2 className="submitted">
              Thank You For Time. The result was successfully submited.
            </h2>
          ) : (
            <h2 className="submitted">Something went wrong</h2>
          )}

          {isDownloadCSVButtonAvailable && (
            <CSVLink {...csvlink} className="download-button" target="_blank">
              Download Responses(CSV)
            </CSVLink>
          )}
        </div>
      )}
    </>
  );
};
export default Details;
