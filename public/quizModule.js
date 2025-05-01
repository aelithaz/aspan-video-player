//quizModule.js

export const quizzes = {
  "wealthReport.mp4": [
    {
      question: "Which of these inferences can be made from the video?",
      options: [
        "2022 resulted in a real wealth loss; real estate may weaken if housing prices drop",
        "2022 resulted in a real wealth loss; real estate may become stronger if housing prices drop",
        "2022 resulted in a real wealth gain; real estate may weaken if housing prices drop",
        "2022 resulted in a real wealth gain; real estate may become stronger if housing prices drop"
      ],
      correct: 0
    },
    {
      question: "About how much was the drop in global household wealth, as reported by the 2023 Credit Suisse Global Wealth Report?",
      options: ["1 trillion", "5 trillion", "10 trillion", "20 trillion"],
      correct: 2
    },
    {
      question: "Which of these options matches regional wealth trends shown in the video?",
      options: [
        "Gains in North America and Latin America and losses in Europe",
        "Gains in North America and Europe and losses in Latin America",
        "Gains in Europe and losses in North America and Latin America",
        "Gains in Latin America and losses in North America and Europe"
      ],
      correct: 3
    },
    {
      question: "Which of these options matches the information mentioned in the video?",
      options: [
        "The top 1%’s wealth share dropped as did the number of millionaires; median global wealth grew",
        "The top 1%’s wealth share dropped; median global wealth grew as did the number of millionaires",
        "The top 1%’s wealth share grew as did the number of millionaires; median global wealth dropped",
        "The top 1%’s wealth share grew; median global wealth dropped as did the number of millionaires"
      ],
      correct: 0
    },
    {
      question: "Around how much was the estimated change in global wealth by 2027?",
      options: ["40% decrease", "40% increase", "20% decrease", "20% increase"],
      correct: 1
    }
  ],
  "genderEquality.mp4": [
    {
      question: "Which is not an issue women face mentioned in the video?",
      options: [
        "The majority of mothers with newborns do not receive maternity cash benefits",
        "Women are at greater risk of food insecurity than men",
        "Sex and/or gender is rarely considered in the development of safety equipment",
        "Sex and/or gender was rarely considered in COVID-19 research"
      ],
      correct: 2
    },
    {
      question: "Which is not an issue women face in the workplace and at home mentioned in the video?",
      options: [
        "The pandemic intensified women’s workload at home",
        "Reports of violence against women and girls are increasing in many parts of the world",
        "Women are not paid as much as men are",
        "Women suffered steeper job losses than men during the pandemic"
      ],
      correct: 2
    },
    {
      question: "What is the approximate ratio of parliamentary seats held by women?",
      options: ["One in two", "One in three", "One in four", "One in five"],
      correct: 2
    },
    {
      question: "How many SDG5 goals were met or almost met according to the latest global assessment of total level?",
      options: ["0", "1", "2", "3"],
      correct: 0
    },
    {
      question: "What year was set as the previous goal for achieving gender equality and women’s empowerment?",
      options: ["2025", "2030", "2035", "2040"],
      correct: 1
    }
  ],
  "branding.mp4": [
    {
      question: "Which of the following options best matches how the video initially describes a brand?",
      options: ["A logo", "Advertising", "Marketing", "A set of unique values", "Corporate identity"],
      correct: 3
    },
    {
      question: "In 2010, how did the value of Coca-cola compare to the GDPs of Bolivia, Kenya, and Bahrain?",
      options: [
        "Just under their total GDP",
        "Over their total GDP",
        "Around the average of their GDPs",
        "Over any one of their GDPs"
      ],
      correct: 1
    },
    {
      question: "Which of these options was not mentioned as something that could be branded?",
      options: ["Services", "People", "Places", "Emotions", "Religions"],
      correct: 3
    },
    {
      question: "What does the video mention as a remarkable achievement for a brand?",
      options: [
        "When the brand becomes a verb",
        "When the brand can afford advertisements featuring high profile celebrities",
        "When the brand becomes a synonym for its product",
        "When the brand is too large to fail"
      ],
      correct: 0
    },
    {
      question: "Which of the following is not a function of a brand mentioned in the video?",
      options: ["Finding information", "Sharing films", "Making music", "Making friends", "Adding to knowledge"],
      correct: 2
    }
  ]
};

/**
 * Renders the quiz for a given video into the container
 * @param {string} videoName - The video file name
 * @param {HTMLElement} container - The element to render the quiz into
 * @param {object} quizAnswers - The object to store selected answers
 * @param {function} onSelect - The handler to call when an answer is selected
 */
export function renderQuiz(videoName, container, quizAnswers, handleAnswer) {
    container.innerHTML = ""; // Clear previous

    const quiz = quizzes[videoName];
    if (!quiz) return;

    quizAnswers[videoName] = quizAnswers[videoName] || [];

    quiz.forEach((q, idx) => {
        const div = document.createElement("div");
        div.className = "quiz-question";

        const questionP = document.createElement("p");
        questionP.innerHTML = `<strong>Q${idx + 1}: ${q.question}</strong>`;
        div.appendChild(questionP);

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "quiz-options";

        q.options.forEach((opt, i) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `q${idx}`;
            input.value = i;
            input.checked = quizAnswers[videoName][idx]?.selectedIndex === i;
            input.onchange = () => handleAnswer(videoName, idx, i);
            label.appendChild(input);
            label.append(` ${opt}`);
            optionsDiv.appendChild(label);
        });

        div.appendChild(optionsDiv);
        container.appendChild(div);
    });
}

export function handleQuizAnswer(videoName, questionIndex, answerIndex, quizAnswers) {
    const question = quizzes[videoName][questionIndex];
    quizAnswers[videoName][questionIndex] = {
      selectedIndex: answerIndex,
      selectedText: question.options[answerIndex]
    };
}