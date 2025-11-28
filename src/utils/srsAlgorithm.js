export const calculateNextReview = (currentLevel, isCorrect) => {
  if (!isCorrect) {
    return {
      level: 0,
      nextReview: new Date().toISOString() // Review immediately or today
    };
  }

  const nextLevel = currentLevel + 1;
  let daysToAdd = 0;

  switch (nextLevel) {
    case 1:
      daysToAdd = 1;
      break;
    case 2:
      daysToAdd = 3;
      break;
    case 3:
      daysToAdd = 7;
      break;
    case 4:
      daysToAdd = 14;
      break;
    case 5:
      daysToAdd = 30;
      break;
    default:
      daysToAdd = 60; // Max interval
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

  return {
    level: nextLevel,
    nextReview: nextReviewDate.toISOString()
  };
};

export const getDueWords = (words) => {
  const now = new Date();
  return words.filter(word => {
    if (!word.nextReview) return true; // New words are due
    return new Date(word.nextReview) <= now;
  });
};
