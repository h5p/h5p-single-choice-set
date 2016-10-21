var H5P = H5P || {};

H5P.SingleChoiceSet = (function ($, UI, Question, SingleChoice, SolutionView, ResultSlide, SoundEffects) {
  /**
   * @constructor
   * @extends Question
   * @param {object} options Options for single choice set
   * @param {string} contentId H5P instance id
   * @param {Object} contentData H5P instance data
   */
  function SingleChoiceSet(options, contentId, contentData) {
    var self = this;

    // Extend defaults with provided options
    this.contentId = contentId;
    Question.call(this, 'single-choice-set');
    this.options = $.extend(true, {}, {
      choices: [],
      behaviour: {
        timeoutCorrect: 2000,
        timeoutWrong: 3000,
        soundEffectsEnabled: true,
        enableRetry: true,
        enableSolutionsButton: true
      }
    }, options);
    if (contentData && contentData.previousState !== undefined) {
      this.currentIndex = contentData.previousState.progress;
      this.results = contentData.previousState.answers;
    }
    this.currentIndex = this.currentIndex || 0;
    this.results = this.results || {
      corrects: 0,
      wrongs: 0
    };
    this.muted = (this.options.behaviour.soundEffectsEnabled === false);

    this.l10n = H5P.jQuery.extend({
      correctText: 'Correct!',
      incorrectText: 'Incorrect! Correct answer was: :text',
      resultSlideTitle: 'You got :numcorrect of :maxscore correct',
      showSolutionButtonLabel: 'Show solution',
      retryButtonLabel: 'Retry',
      closeButtonLabel: 'Close',
      solutionViewTitle: 'Solution',
      slideOfTotal: 'Slide :num of :total',
      muteButtonLabel: "Mute feedback sound"
    }, options.l10n !== undefined ? options.l10n : {});

    this.$container = $('<div>', {
      'class': 'h5p-sc-set-wrapper'
    });

    this.$slides = [];
    // An array containing the SingleChoice instances
    this.choices = [];

    /**
     * The solution dialog
     * @type {SolutionView}
     */
    this.solutionView = new SolutionView(contentId, this.options.choices, this.l10n);

    // Focus on "try-again"-button when closing solution view
    this.solutionView.on('hide', function (){
     self.focusButton('try-again');
    });

    this.$choices = $('<div>', {
      'class': 'h5p-sc-set h5p-sc-animate'
    });

    // sometimes an empty object is in the choices
    this.options.choices = this.options.choices.filter(function(choice){
      return choice !=undefined && !!choice.answers;
    });

    var numQuestions = this.options.choices.length;

    // Create progressbar
    self.progressbar = UI.createProgressbar(numQuestions, {
      progressText: this.l10n.slideOfTotal
    });
    self.progressbar.setProgress(this.currentIndex);

    for (var i = 0; i < this.options.choices.length; i++) {
      var choice = new SingleChoice(this.options.choices[i], i, this.contentId);
      choice.on('finished', this.handleQuestionFinished, this);
      choice.on('alternative-selected', this.handleAlternativeSelected, this);
      choice.appendTo(this.$choices, (i === this.currentIndex));
      this.choices.push(choice);
      this.$slides.push(choice.$choice);
    }

    this.resultSlide = new ResultSlide(this.options.choices.length);
    this.resultSlide.appendTo(this.$choices);
    this.resultSlide.on('retry', this.resetTask, this);
    this.resultSlide.on('view-solution', this.handleViewSolution, this);
    this.$slides.push(this.resultSlide.$resultSlide);
    this.on('resize', this.resize, this);

    // Use the correct starting slide
    this.recklessJump(this.currentIndex);

    if (this.options.choices.length === this.currentIndex) {
      // Make sure results slide is displayed
      this.resultSlide.$resultSlide.addClass('h5p-sc-current-slide');
      this.setScore(this.results.corrects, true, 0);
    }

    if (!this.muted) {
      setTimeout(function () {
        SoundEffects.setup();
      },1);
    }

    var hideButtons = [];

    /**
     * Keeps track of buttons that will be hidden
     * @type {Array}
     */
    self.buttonsToBeHidden = [];

    /**
     * Override Question's hideButton function
     * to be able to hide buttons after delay
     *
     * @override
     * @param {string} id
     */
    this.superHideButton = self.hideButton;
    this.hideButton = (function () {
      return function (id) {

        if (!self.scoreTimeout) {
          return self.superHideButton(id);
        }

        self.buttonsToBeHidden.push(id);
        return this;
      };
    })();
  }

  SingleChoiceSet.prototype = Object.create(Question.prototype);
  SingleChoiceSet.prototype.constructor = SingleChoiceSet;

  /**
   * Set if a element is tabbable or not
   *
   * @param {jQuery} $element The element
   * @param {boolean} tabbable If element should be tabbable
   * @returns {jQuery} The element
   */
  SingleChoiceSet.prototype.setTabbable = function ($element, tabbable) {
    $element.attr('tabindex', tabbable ? 0 : -1);
    return $element;
  };

  /**
   * Handle alternative selected, i.e play sound if sound effects are enabled
   * 
   * @method handleAlternativeSelected
   * @param  {Object} event Event that was fired
   */
  SingleChoiceSet.prototype.handleAlternativeSelected = function (event) {
    var self = this;
    var isCorrect = event.data.correct;
    var index = event.data.index;
    var question = self.choices[index];
    var correctAlternative = self.findCorrectAlternativeFromQuestion(question);

    // Announce by ARIA if answer is correct or incorrect
    self.announce(isCorrect ? self.l10n.correctText : self.l10n.incorrectText.replace(':text', correctAlternative.options.text));
    setTimeout(self.dropLive, 500);

    if (!this.muted) {
      // Can't play it after the transition end is received, since this is not
      // accepted on iPad. Therefore we are playing it here with a delay instead
      SoundEffects.play(isCorrect ? 'positive-short' : 'negative-short', 700);
    }
  };

  /**
   * Takes a question, and returns the correct alternative
   *
   * @param {H5P.SingleChoiceSet.SingleChoice} question The question you want to find the answer to
   * @returns {Alternative} The correct alternative
   */
  SingleChoiceSet.prototype.findCorrectAlternativeFromQuestion = function (question) {
    return question.alternatives.filter(function (alternative){
      return alternative.options.correct;
    })[0];
  };

  /**
   * Handler invoked when question is done
   *
   * @param  {object} data An object containing a single boolean property: "correct".
   */
  SingleChoiceSet.prototype.handleQuestionFinished = function (event) {
    var self = this;

    if (event.data.correct) {
      self.results.corrects++;
    }
    else {
      self.results.wrongs++;
    }

    self.triggerXAPI('interacted');

    // if should show result slide
    if (self.currentIndex+1 >= self.options.choices.length) {
      self.setScore(self.results.corrects);
    }

    var letsMove = function () {
      // Handle impatient users
      self.$container.off('click.impatient keydown.impatient');
      clearTimeout(timeout);
      self.move(self.currentIndex+1);
    };

    var timeout = setTimeout(function () {
      letsMove();
    }, event.data.correct ? self.options.behaviour.timeoutCorrect : self.options.behaviour.timeoutWrong);

    self.$container.on('click.impatient', function () {
      letsMove();
    });

    self.$container.on('keydown.impatient', function (event) {
      // If return, space or right arrow
      if(event.which === 13 || event.which === 32 || event.which === 39) {
        letsMove();
      }
    });
  };

  SingleChoiceSet.prototype.dropLive = function () {
    if (this.$liveRegion) {
      var node = this.$liveRegion[0];
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  };

  SingleChoiceSet.prototype.announce = function (text) {
    this.$liveRegion = $('<div>', {
      'class': 'h5p-baq-live-feedback',
      'aria-live': 'assertive',
      'width': '1px',
      'height': '1px',
      html: text
    }).appendTo(document.body);
  };

  /**
   * Handles buttons that are queued for hiding
   */
  SingleChoiceSet.prototype.handleQueuedButtonChanges = function () {
    var self = this;

    if (self.buttonsToBeHidden.length) {
      self.buttonsToBeHidden.forEach(function (id) {
        self.superHideButton(id);
      });
    }
    self.buttonsToBeHidden = [];
  };

  /**
   * Set score and feedback
   *
   * @params {Number} score Number of correct answers
   */
  SingleChoiceSet.prototype.setScore = function (score, noXAPI, timeout) {
    var self = this;

    // Find last selected alternative, and determine timeout before solution slide shows
    if (!self.choices.length) {
      return;
    }
    var lastSelected = self.choices[self.choices.length - 1]
      .$choice
      .find('.h5p-sc-alternative.h5p-sc-selected');

    var timeout = (timeout !== undefined) ? timeout : (lastSelected.is('.h5p-sc-is-correct') ?
      this.options.behaviour.timeoutCorrect :
      this.options.behaviour.timeoutWrong);

    /**
     * Show feedback and buttons on result slide
     */
    var showFeedback = function () {
      self.setFeedback(self.l10n.resultSlideTitle
          .replace(':numcorrect', score)
          .replace(':maxscore', self.options.choices.length),
        score, self.options.choices.length);

      if (score === self.options.choices.length) {
        self.hideButton('try-again');
        self.hideButton('show-solution');
      }
      else {
        self.showButton('try-again');
        self.showButton('show-solution');
      }
      self.handleQueuedButtonChanges();
      self.scoreTimeout = undefined;

      if (!noXAPI) {
        self.triggerXAPIScored(score, self.options.choices.length, 'completed');
      }

      self.trigger('resize');
    };

    /**
     * Wait for result slide animation
     */
    self.scoreTimeout = setTimeout(function () {
      showFeedback();
    }, (timeout));

    // listen for impatient keyboard clicks
    self.$container.one('keydown.impatient', function (event) {
      // If return, space or right arrow
      if(event.which === 13 || event.which === 32 || event.which === 39) {
        clearTimeout(self.scoreTimeout);
        showFeedback();
      }
    });

    /**
     * Listen for impatient clicks.
     * On impatient clicks clear timeout and immediately show feedback.
     */
    self.$container.one('click.impatient', function () {
      clearTimeout(self.scoreTimeout);
      showFeedback();
    });
  };

  /**
   * Handler invoked when view solution is selected
   */
  SingleChoiceSet.prototype.handleViewSolution = function () {
    var self = this;

    self.setTabbable(self.$muteButton, false);

    self.solutionView.on('hide', function(){
      self.setTabbable(self.$muteButton, true);
    });

    self.solutionView.show();
  };

  /**
   * Register DOM elements before they are attached.
   * Called from H5P.Question.
   */
  SingleChoiceSet.prototype.registerDomElements = function () {
    // Register task content area.
    this.setContent(this.createQuestion());

    // Register buttons with question.
    this.addButtons();

    // Insert feedback and buttons section on the result slide
    this.insertSectionAtElement('feedback', this.resultSlide.$feedbackContainer);
    this.insertSectionAtElement('buttons', this.resultSlide.$buttonContainer);

    // Question is finished
    if (this.options.choices.length === this.currentIndex) {
      this.trigger('question-finished');
    }
  };

  /**
   * Add Buttons to question.
   */
  SingleChoiceSet.prototype.addButtons = function () {
    var self = this;

    if (this.options.behaviour.enableRetry) {
      this.addButton('try-again', this.l10n.retryButtonLabel, function () {
        self.resetTask();
      }, self.results.corrects !== self.options.choices.length);
    }

    if (this.options.behaviour.enableSolutionsButton) {
      this.addButton('show-solution', this.l10n.showSolutionButtonLabel, function () {
        self.showSolutions();
      }, self.results.corrects !== self.options.choices.length);
    }
  };

  /**
   * Create main content
   */
  SingleChoiceSet.prototype.createQuestion = function () {
    var self = this;

    self.$container.append(self.$choices);
    self.progressbar.appendTo(self.$container);

    function toggleMute(event){
      var $button = $(event.target);
      event.preventDefault();
      self.muted = !self.muted;
      $button.attr('aria-pressed', self.muted);
    }

    if (self.options.behaviour.soundEffectsEnabled) {
      self.$muteButton = $('<div>', {
        'class': 'h5p-sc-sound-control',
        'tabindex' : 0,
        'role': 'button',
        'aria-label': self.l10n.muteButtonLabel,
        'aria-pressed': false,
        'on': {
          'keydown': function (event) {
            switch (event.which) {
              case 13: // Enter
              case 32: // Space
                toggleMute(event);
                break;
            }
          }
        },
        'click': toggleMute
      });

      self.$container.append(self.$muteButton);
    }

    // Append solution view - hidden by default:
    self.solutionView.appendTo(self.$container);

    self.resize();

    // Hide all other slides than the current one:
    self.$container.addClass('initialized');

    return self.$container;
  };

  /**
   * Resize if something outside resizes
   */
  SingleChoiceSet.prototype.resize = function () {
    var self = this;
    var maxHeight = 0;
    self.choices.forEach(function (choice) {
      var choiceHeight = choice.$choice.outerHeight();
      maxHeight = choiceHeight > maxHeight ? choiceHeight : maxHeight;
    });

    // Set minimum height for choices
    self.$choices.css({minHeight: maxHeight + 'px'});
  };

  /**
   * Will jump to the given slide without any though to animations,
   * current slide etc.
   *
   * @public
   */
  SingleChoiceSet.prototype.recklessJump = function (index) {
    var tX = 'translateX('+(-index*100)+'%)';
    this.$choices.css({'-webkit-transform':tX,'-moz-transform':tX,'-ms-transform':tX,'transform':tX});
    this.progressbar.setProgress(index + 1);
  };

  /**
   * Move to slide n
   * @param  {number} index The slide number    to move to
   */
  SingleChoiceSet.prototype.move = function (index) {
    var self = this;
    if (index === this.currentIndex) {
      return;
    }

    var $previousSlide = self.$slides[self.currentIndex];
    var $currentChoice = self.choices[index];
    var $currentSlide = self.$slides[index];

    H5P.Transition.onTransitionEnd(self.$choices, function () {
      $previousSlide.removeClass('h5p-sc-current-slide');

      // on slides with answers focus on first alternative
      if(index < self.choices.length){
        $currentChoice.focusOnAlternative(0);
      }
      // on last slide, focus on try again button
      else {
        self.focusButton('try-again');
      }
    }, 600);

    $currentSlide.addClass('h5p-sc-current-slide');
    self.recklessJump(index);

    self.currentIndex = index;
  };

  /**
   * The following functions implements the CP and IV - Contracts v 1.0 documented here:
   * http://h5p.org/node/1009
   */
  SingleChoiceSet.prototype.getScore = function () {
    return this.results.corrects;
  };
  SingleChoiceSet.prototype.getMaxScore = function () {
   return this.options.choices.length;
  };
  SingleChoiceSet.prototype.getAnswerGiven = function () {
    return (this.results.corrects + this.results.wrongs) > 0;
  };
  SingleChoiceSet.prototype.getTitle = function () {
    return (this.options.choices[0] ? H5P.createTitle(this.options.choices[0].question) : '');
  };
  SingleChoiceSet.prototype.showSolutions = function () {
    this.handleViewSolution();
  };
  /**
   * Reset all answers. This is equal to refreshing the quiz
   */
  SingleChoiceSet.prototype.resetTask = function () {
    var self = this;

    // Close solution view if visible:
    this.solutionView.hide();

    // Reset the user's answers
    var classes = ['h5p-sc-reveal-wrong', 'h5p-sc-reveal-correct', 'h5p-sc-selected', 'h5p-sc-drummed', 'h5p-sc-correct-answer'];
    for (var i = 0; i < classes.length; i++) {
      this.$choices.find('.' + classes[i]).removeClass(classes[i]);
    }
    this.results = {
      corrects: 0,
      wrongs: 0
    };

    this.choices.forEach(function (choice){
      choice.setAnswered(false);
    });

    this.move(0);

    // Wait for transition, then remove feedback.
    H5P.Transition.onTransitionEnd(this.$choices, function () {
      self.setFeedback();
    }, 600);
  };

  /**
   * Clever comment.
   *
   * @public
   * @returns {object}
   */
  SingleChoiceSet.prototype.getCurrentState = function () {
    return {
      progress: this.currentIndex,
      answers: this.results
    };
  };

  return SingleChoiceSet;

})(H5P.jQuery, H5P.JoubelUI, H5P.Question, H5P.SingleChoiceSet.SingleChoice, H5P.SingleChoiceSet.SolutionView, H5P.SingleChoiceSet.ResultSlide, H5P.SingleChoiceSet.SoundEffects);
