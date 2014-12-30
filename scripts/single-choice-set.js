var H5P = H5P || {};

H5P.SingleChoiceSet = (function ($, SingleChoice, SolutionView, ResultSlide, SoundEffects) {

  /**
   * @constuctor
   * @param  {object} options Options for single choice set
   */
  function SingleChoiceSet(options) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      choices: [],
      settings: {
        timeoutCorrect: 2000,
        timeoutWrong: 3000,
        soundEffectsEnabled: true,
        retryEnabled: true,
        showSolutionEnabled: true
      }
    }, options);
    this.currentIndex = 0;
    this.results = {
      corrects: 0,
      wrongs: 0
    };
    this.$slides = [];

    this.solutionView = new SolutionView(this.options.choices);

    if (this.options.settings.soundEffectsEnabled === true) {
      SoundEffects.setup();
    }
  }

  /**
   * Handler invoked when question is done
   *
   * @param  {object} data An object containing a single boolean property: "correct".
   */
  SingleChoiceSet.prototype.handleQuestionFinished = function (data) {
    var self = this;

    setTimeout(function () {
      if (data.correct) {
        self.results.corrects++;
      }
      else {
        self.results.wrongs++;
      }

      if (self.currentIndex+1 >= self.options.choices.length) {
        self.resultSlide.setScore(self.results.corrects);
      }

      self.move(self.currentIndex+1);
    }, data.correct ? self.options.settings.timeoutCorrect : self.options.settings.timeoutWrong);
  };

  /**
   * Handler invoked when retry is selected
   */
  SingleChoiceSet.prototype.handleRetry = function () {
    this.reset();
    this.move(0);
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
    self.$choices = $('<div>', {
      'class': 'h5p-sc-set h5p-animate'
    });
    self.$progressbar = $('<div>', {
      'class': 'h5p-sc-set-progress'
    });
    self.$progressCompleted = $('<div>', {
      'class': 'h5p-sc-completed'
    }).appendTo(self.$progressbar);

    // An array containin the SingleChoice instances
    self.choices = [];

    for (var i=0; i<this.options.choices.length; i++) {
      var choice = new SingleChoice(this.options.choices[i], i);
      choice.on('finished', self.handleQuestionFinished, self);
      choice.attach(self.$choices, (i === 0));
      self.choices.push(choice);
      self.$slides.push(choice.$choice);
    }

    self.resultSlide = new ResultSlide(self.options.choices.length, self.options.settings.showSolutionEnabled, self.options.settings.retryEnabled);
    self.resultSlide.attach(self.$choices);
    self.resultSlide.on('retry', function () {
      self.handleRetry();
    });
    self.resultSlide.on('view-solution', function () {
      self.handleViewSolution();
    });
    self.$slides.push(self.resultSlide.$resultSlide);

    $container.append(self.$choices);
    $container.append(self.$progressbar);

    if (self.options.settings.soundEffectsEnabled) {
      $container.append($('<div>', {
        'class': 'h5p-sc-sound-control',
        'click': function () {
          SoundEffects.muted = !SoundEffects.muted;
          $(this).toggleClass('muted', SoundEffects.muted);
        }
      }));
    }

    self.$progressCompleted.css({width: (1/(self.options.choices.length+1))*100 + '%'});

    // Append solution view - hidden by default:
    self.solutionView.appendTo($('body'));

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
    var translateX = 'translateX(' + (-index*100) + '%)';
    var $previousSlide = this.$slides[this.currentIndex];

    BrowserUtils.onTransitionEnd(this.$choices, function () {
      $previousSlide.removeClass('h5p-current');
    }, 600);

    this.$slides[index].addClass('h5p-current');
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
   * Reset all answers. Equal to refreshing the page.
   */
  SingleChoiceSet.prototype.reset = function () {
    // Reset the user's answers
    var classes = ['h5p-sc-reveal-wrong', 'h5p-sc-reveal-correct', 'h5p-sc-selected', 'h5p-sc-drummed', 'h5p-sc-correct-answer'];
    for (var i = 0; i < classes.length; i++) {
      this.$choices.find('.' + classes[i]).removeClass(classes[i]);
    }
    this.results = {
      corrects: 0,
      wrongs: 0
    };
  };

  return SingleChoiceSet;

})(H5P.jQuery, H5P.SingleChoice, H5P.SingleChoiceSolutionView, H5P.SingleChoiceResultSlide, H5P.SoundEffects);
