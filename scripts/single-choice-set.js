var H5P = H5P || {};

H5P.SingleChoiceSet = (function ($, SingleChoice, SolutionView, ResultSlide, SoundEffects) {
  /**
   * @constuctor
   * @param {object} options Options for single choice set
   * @param {string} id H5P instance id
   */
  function SingleChoiceSet(options, contentId) {
    // Extend defaults with provided options
    this.contentId = contentId;
    H5P.EventDispatcher.call(this);
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
    this.currentIndex = 0;
    this.results = {
      corrects: 0,
      wrongs: 0
    };

    this.l10n = H5P.jQuery.extend({
      resultSlideTitle: 'You got :numcorrect of :maxscore correct',
      showSolutionButtonLabel: 'Show solution',
      retryButtonLabel: 'Retry',
      goBackButtonLabel: 'Go back',
      solutionViewTitle: 'Solution'
    }, options.l10n !== undefined ? options.l10n : {});

    this.$slides = [];
    // An array containing the SingleChoice instances
    this.choices = [];

    this.solutionView = new SolutionView(this.options.choices, this.l10n);

    this.$choices = $('<div>', {
      'class': 'h5p-sc-set h5p-sc-animate'
    });
    this.$progressbar = $('<div>', {
      'class': 'h5p-sc-set-progress'
    });
    this.$progressCompleted = $('<div>', {
      'class': 'h5p-sc-completed'
    }).appendTo(this.$progressbar);

    for (var i = 0; i < this.options.choices.length; i++) {
      var choice = new SingleChoice(this.options.choices[i], i);
      choice.on('finished', this.handleQuestionFinished, this);
      choice.appendTo(this.$choices, (i === 0));
      this.choices.push(choice);
      this.$slides.push(choice.$choice);
    }

    this.resultSlide = new ResultSlide(this.options.choices.length, this.options.behaviour.enableSolutionsButton, this.options.behaviour.enableRetry, this.l10n);
    this.resultSlide.appendTo(this.$choices);
    this.resultSlide.on('retry', this.resetTask, this);
    this.resultSlide.on('view-solution', this.handleViewSolution, this);
    this.$slides.push(this.resultSlide.$resultSlide);
    this.on('resize', this.resize, this);
  }

  SingleChoiceSet.prototype = Object.create(H5P.EventDispatcher.prototype);
  SingleChoiceSet.prototype.constructor = SingleChoiceSet;

  /**
   * Handler invoked when question is done
   *
   * @param  {object} data An object containing a single boolean property: "correct".
   */
  SingleChoiceSet.prototype.handleQuestionFinished = function (data) {
    var self = this;

    if (data.correct) {
      self.results.corrects++;
    }
    else {
      self.results.wrongs++;
    }

    if (self.currentIndex+1 >= self.options.choices.length) {
      self.resultSlide.setScore(self.results.corrects);
      self.triggerXAPICompleted(self.results.corrects, self.options.choices.length);
    }

    var letsMove = function () {
      // Handle impatient users
      self.$container.off('click.impatient keydown.impatient');
      clearTimeout(timeout);
      self.move(self.currentIndex+1);
    };

    var timeout = setTimeout(function () {
      letsMove();
    }, data.correct ? self.options.behaviour.timeoutCorrect : self.options.behaviour.timeoutWrong);

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

  /**
   * Handler invoked when view solution is selected
   */
  SingleChoiceSet.prototype.handleViewSolution = function () {
    this.solutionView.show();
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
   SingleChoiceSet.prototype.attach = function ($container) {
    var self = this;
    self.$container = $container;
    $container.addClass('h5p-sc-set-wrapper');

    $container.append(self.$choices);
    $container.append(self.$progressbar);

    if (self.options.behaviour.soundEffectsEnabled) {
      $container.append($('<div>', {
        'class': 'h5p-sc-sound-control',
        'click': function () {
          SoundEffects.muted = !SoundEffects.muted;
          $(this).toggleClass('muted', SoundEffects.muted);
        }
      }));

      setTimeout(function () {
        SoundEffects.setup();
      },1);
    }

    self.$progressCompleted.css({width: ((1 / (self.options.choices.length + 1)) * 100) + '%'});

    // Append solution view - hidden by default:
    self.solutionView.appendTo($container);

    self.resize();

    // Hide all other slides than the current one:
    $container.addClass('initialized');
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

    self.$choices.css({height: maxHeight + 'px'});
  };

  /**
   * Move to slide n
   * @param  {number} index The slide number    to move to
   */
  SingleChoiceSet.prototype.move = function (index) {
    if (index === this.currentIndex) {
      return;
    }

    var translateX = 'translateX(' + (-index*100) + '%)';
    var $previousSlide = this.$slides[this.currentIndex];

    H5P.Transition.onTransitionEnd(this.$choices, function () {
      $previousSlide.removeClass('h5p-sc-current-slide');
    }, 600);

    this.$slides[index].addClass('h5p-sc-current-slide');
    this.$choices.css({
      '-webkit-transform': translateX,
      '-moz-transform': translateX,
      '-ms-transform': translateX,
      'transform': translateX
    });

    this.currentIndex = index;
    this.$progressCompleted.css({width: ((this.currentIndex+1)/(this.options.choices.length+1))*100 + '%'});
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
  SingleChoiceSet.prototype.showSolutions = function () {
    this.handleViewSolution();
  };
  /**
   * Reset all answers. This is equal to refreshing the quiz
   */
  SingleChoiceSet.prototype.resetTask = function () {
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

    this.move(0);
  };

  return SingleChoiceSet;

})(H5P.jQuery, H5P.SingleChoiceSet.SingleChoice, H5P.SingleChoiceSet.SolutionView, H5P.SingleChoiceSet.ResultSlide, H5P.SingleChoiceSet.SoundEffects);
