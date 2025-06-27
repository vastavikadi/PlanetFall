import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

const QuizContainer = styled.div`
  margin-top: 20px;
`;

const QuestionCard = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const QuestionNumber = styled.div`
  font-size: 0.9rem;
  color: var(--primary);
  margin-bottom: 10px;
  font-weight: 600;
`;

const QuestionText = styled.h3`
  font-size: 1.3rem;
  color: var(--light);
  margin-bottom: 20px;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionButton = styled.button`
  background-color: ${props => 
    props.selected 
      ? props.correct 
        ? 'rgba(87, 217, 130, 0.2)' 
        : 'rgba(255, 87, 87, 0.2)'
      : 'rgba(255, 255, 255, 0.05)'
  };
  border: 2px solid ${props => 
    props.selected 
      ? props.correct 
        ? 'var(--tertiary)' 
        : 'var(--secondary)'
      : 'transparent'
  };
  border-radius: 8px;
  padding: 15px;
  text-align: left;
  color: var(--light);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => 
      props.selected 
        ? props.correct 
          ? 'rgba(87, 217, 130, 0.2)' 
          : 'rgba(255, 87, 87, 0.2)'
        : 'rgba(255, 255, 255, 0.1)'
    };
  }
  
  &:disabled {
    cursor: default;
  }
`;

const OptionIcon = styled.div`
  margin-right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => 
    props.correct 
      ? 'var(--tertiary)' 
      : props.incorrect 
        ? 'var(--secondary)' 
        : 'var(--primary)'
  };
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--dark);
  font-size: 0.8rem;
  font-weight: 600;
`;

const OptionText = styled.div`
  flex: 1;
`;

const Feedback = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => 
    props.correct 
      ? 'rgba(87, 217, 130, 0.1)' 
      : 'rgba(255, 87, 87, 0.1)'
  };
  color: ${props => 
    props.correct 
      ? 'var(--tertiary)' 
      : 'var(--secondary)'
  };
  font-size: 0.9rem;
`;

const ImposterHint = styled.div`
  margin-top: 5px;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--secondary);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--primary);
  transition: width 0.3s ease;
`;

const MessageBox = styled.div`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  color: var(--light);
  margin-top: 100px;
`;


const sampleQuestions = [
  {
    id: 1,
    text: "Which programming language was used to write the first version of Twitter?",
    options: ["Ruby on Rails", "PHP", "Python", "Java"],
    correctAnswer: 0
  },
  {
    id: 2,
    text: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
    correctAnswer: 0
  },
  {
    id: 3,
    text: "Which of these is NOT a JavaScript framework or library?",
    options: ["Angular", "React", "Django", "Vue"],
    correctAnswer: 2
  },
  {
    id: 4,
    text: "What is the most common use of CSS?",
    options: ["To define the structure of web pages", "To style web pages", "To create interactive elements", "To connect to databases"],
    correctAnswer: 1
  },
  {
    id: 5,
    text: "Which data structure follows the LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correctAnswer: 1
  }
];

const QuizRound = () => {
  const { quiz, submitAnswer, isImposter } = useGame();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  

  const questions = quiz?.questions?.length > 0 ? quiz.questions : sampleQuestions;
  

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  

  const areAllQuestionsAnswered = currentQuestion >= questions.length;
  
  useEffect(() => {

    setSelectedOption(null);
    setShowFeedback(false);
    setIsAnswerSubmitted(false);
  }, [currentQuestion]);
  

  useEffect(() => {
    if (quiz?.answers && quiz.answers[currentQuestion] !== undefined) {
      setSelectedOption(quiz.answers[currentQuestion]);
      setIsAnswerSubmitted(true);
    }
  }, [quiz, currentQuestion]);
  
  const handleOptionSelect = (optionIndex) => {
    if (isAnswerSubmitted) return;
    
    setSelectedOption(optionIndex);
    

    const currentQuestionData = questions[currentQuestion];
    const correct = optionIndex === currentQuestionData.correctAnswer;
    setIsCorrect(correct);
    

    setShowFeedback(true);
    

    submitAnswer(currentQuestion, optionIndex);
    setIsAnswerSubmitted(true);
    

    setTimeout(() => {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    }, 2000);
  };
  

  const getImposterHint = () => {
    if (!isImposter) return null;
    
    const currentQuestionData = questions[currentQuestion];
    const correctAnswer = currentQuestionData.correctAnswer;
    

    const wrongOptions = currentQuestionData.options
      .map((option, index) => index)
      .filter(index => index !== correctAnswer);
    

    const suggestedWrongIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    
    return `As the imposter, consider selecting "${currentQuestionData.options[suggestedWrongIndex]}" to sabotage.`;
  };
  
  if (!questions || questions.length === 0) {
    return (
      <MessageBox>
        <h3>Waiting for questions to load...</h3>
        <p>The quiz will begin shortly.</p>
      </MessageBox>
    );
  }
  
  if (areAllQuestionsAnswered) {
    return (
      <MessageBox>
        <h3>All questions completed!</h3>
        <p>Waiting for other players to finish...</p>
      </MessageBox>
    );
  }
  
  const currentQuestionData = questions[currentQuestion];
  
  return (
    <QuizContainer>
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>
      
      <AnimatePresence mode="wait">
        <QuestionCard
          key={`question-${currentQuestion}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <QuestionNumber>Question {currentQuestion + 1} of {questions.length}</QuestionNumber>
          <QuestionText>{currentQuestionData.text}</QuestionText>
          
          <OptionsContainer>
            {currentQuestionData.options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(index)}
                selected={selectedOption === index}
                correct={showFeedback && index === currentQuestionData.correctAnswer}
                disabled={isAnswerSubmitted}
              >
                <OptionIcon 
                  correct={showFeedback && index === currentQuestionData.correctAnswer}
                  incorrect={showFeedback && selectedOption === index && selectedOption !== currentQuestionData.correctAnswer}
                >
                  {String.fromCharCode(65 + index)} {/* A, B, C, D... */}
                </OptionIcon>
                <OptionText>{option}</OptionText>
              </OptionButton>
            ))}
          </OptionsContainer>
          
          {showFeedback && (
            <Feedback correct={isCorrect}>
              {isCorrect 
                ? 'Correct! The planet health has improved.' 
                : `Incorrect. The correct answer was "${currentQuestionData.options[currentQuestionData.correctAnswer]}".`}
            </Feedback>
          )}
          
          {isImposter && !isAnswerSubmitted && (
            <ImposterHint>{getImposterHint()}</ImposterHint>
          )}
        </QuestionCard>
      </AnimatePresence>
    </QuizContainer>
  );
};

export default QuizRound;