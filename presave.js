var H5PPresave = H5PPresave || {};

H5PPresave['H5P.SingleChoiceSet'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 0;

  if (isContentInValid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid Single Choice Error');
  }

  score = content.choices.length;

  presave.validateScore(score);

  if (finished) {
    finished({maxScore: score});
  }

  function isContentInValid() {
    return !presave.checkNestedRequirements(content, 'content.choices') || !Array.isArray(content.choices);
  }
};
