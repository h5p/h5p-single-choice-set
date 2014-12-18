/*

- Kommentere alle funksjoner med jsdoc syntax
- Gjøre om resultview-visning
- Dele opp attach i flere funksjoner!
- Teste i ulike nettlesere!

*/

var H5P = H5P || {};

H5P.SingleChoiceSet = (function ($, SingleChoice, SolutionView, ResultSlide) {
  /**
   * Constructor function.
   */
  function SingleChoiceSet(options, id) {
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
    // Keep provided id.
    this.id = id;
    this.currentIndex = 0;
    this.results = {
      corrects: 0,
      wrongs: 0
    };
    this.muted = false;

    this.solutionView = new SolutionView(this.options.choices);

    /*if (this.options.settings.soundEffectsEnabled === true && SingleChoiceSet.libraryPath === undefined) {
      SingleChoiceSet.setupSoundEffects();
    }*/
  }

  SingleChoiceSet.setupSoundEffects = function () {
    if (SingleChoiceSet.libraryPath !== undefined) {
      SingleChoiceSet.libraryPath = H5PIntegration.getLibraryPath('H5P.SingleChoiceSet-1.0');
      SingleChoiceSet.positiveAudio = new Audio(SingleChoiceSet.libraryPath + '/positive.mp3');
      SingleChoiceSet.positiveAudio.load();
      /*$(SingleChoiceSet.positiveAudio).on('played', function(event) {
        console.log(event);
      });*/
      SingleChoiceSet.negativeAudio = new Audio(SingleChoiceSet.libraryPath + '/negative.mp3');
      SingleChoiceSet.negativeAudio.load();
      /*SingleChoiceSet.negativeAudio.onerror = function() {
        alert("Can start playing video");
      };*/
    }
  };

  SingleChoiceSet.playAudioFeedback = function (correct) {
    SingleChoiceSet.setupSoundEffects();

    if (correct === true) {
      SingleChoiceSet.positiveAudio.play();
    }
    else {
      SingleChoiceSet.negativeAudio.play();
    }
  }

  /**
   *
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

      /*if (self.options.resultUpdated) {
        self.options.resultUpdated(self.results.corrects, self.options.choices.length, self.options.playerNum);
      }*/

      if(self.currentIndex+1 >= self.options.choices.length) {
        self.resultSlide.setScore(self.results.corrects);
      }

      self.move(self.currentIndex+1);
    }, data.correct ? self.options.settings.timeoutCorrect : self.options.settings.timeoutWrong);
  };

  SingleChoiceSet.prototype.handleRetry = function () {
    this.reset();
    this.move(0);
  };

  SingleChoiceSet.prototype.handleViewSolution = function () {
    var self = this;

    var $solutionButton = self.resultSlide.getSolutionButton();
    var offset = $solutionButton.offset();
    var width = $solutionButton.outerWidth();
    var height = $solutionButton.outerHeight();

    self.solutionView.$solutionView.css({
      left: offset.left + 'px',
      top: (offset.top - $('body').scrollTop()) + 'px',
      width: width + 'px',
      height: height + 'px'
    });
    self.solutionView.show();
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
      'class': 'h5p-single-choice-set h5p-animate'
    });
    self.$progressbar = $('<div>', {
      'class': 'h5p-single-choice-set-progress'
    });
    self.$progressCompleted = $('<div>', {
      'class': 'h5p-completed'
    }).appendTo(self.$progressbar);

    // An array containin the SingleChoice instances
    self.choices = [];

    var playSoundEffect = function (data) {
      if (self.muted === false) {
        SingleChoiceSet.playAudioFeedback(data.correct);
      }
    };

    for (var i=0; i<this.options.choices.length; i++) {
      var choice = new SingleChoice(this.options.choices[i], i);
      if (self.options.settings.soundEffectsEnabled === true) {
        choice.on('alternative-selected', playSoundEffect);
      }
      choice.on('finished', function (data) {
        self.handleQuestionFinished(data);
      });
      choice.attach(self.$choices, (i === 0));
      self.choices.push(choice);
    }

    self.resultSlide = new ResultSlide(self.options.choices.length, self.options.settings.showSolutionEnabled, self.options.settings.retryEnabled);
    self.resultSlide.attach(self.$choices);
    self.resultSlide.on('retry', function () {
      self.handleRetry();
    });
    self.resultSlide.on('view-solution', function () {
      self.handleViewSolution();
    });

    $container.append(self.$choices);
    $container.append(self.$progressbar);

    if (self.options.settings.soundEffectsEnabled) {
      $container.append($('<div>', {
        'class': 'sound-control',
        'click': function () {
          self.muted = !self.muted;
          $(this).toggleClass('muted', self.muted);

          self.choices.forEach(function (choice) {
            choice.muted = self.muted;
          });
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

  SingleChoiceSet.prototype.resize = function () {
    var self = this;
    var maxHeight = 0;
    self.choices.forEach(function (choice) {
      var choiceHeight = choice.$choice.outerHeight();
      maxHeight = choiceHeight > maxHeight ? choiceHeight : maxHeight;
    });
    self.$choices.css({height: maxHeight + 'px'});
  };

  SingleChoiceSet.prototype.move = function (index) {
    var translateX = 'translateX(' + (-index*100) + '%)';
    var $previousSlide = this.$choices.find('.h5p-current');

    BrowserUtils.onTransitionEnd(this.$choices, function () {
      $previousSlide.removeClass('h5p-current');
    }, 600);

    this.$choices.find('.h5p-slide:nth-child(' + (index + 1) + ')').addClass('h5p-current');
    this.$choices.css({
      '-webkit-transform': translateX,
      '-moz-transform': translateX,
      '-ms-transform': translateX,
      'transform': translateX
    });

    this.currentIndex = index;
    this.$progressCompleted.css({width: ((this.currentIndex+1)/(this.options.choices.length+1))*100 + '%'});
  };

  SingleChoiceSet.prototype.reset = function () {
    // Reset the user's answers
    var classes = ['reveal-wrong', 'reveal-correct', 'selected', 'drummed', 'correct-answer'];
    for (var i = 0; i < classes.length; i++) {
      this.$choices.find('.' + classes[i]).removeClass(classes[i]);
    }
    this.results = {
      corrects: 0,
      wrongs: 0
    };
  };

  return SingleChoiceSet;

})(H5P.jQuery, H5P.SingleChoice, H5P.SingleChoiceSolutionView, H5P.SingleChoiceResultSlide);
