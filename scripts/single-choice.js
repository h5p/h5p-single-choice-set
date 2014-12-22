var H5P = H5P || {};

H5P.SingleChoice = (function ($, EventEmitter, Alternative, BrowserUtils, SoundEffects) {
  /**
   * Constructor function.
   */
  function SingleChoice(options, index) {
    EventEmitter.call(this);
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      question: '',
      answers: []
    }, options);
    // Keep provided id.
    this.index = index;

    for (var i=0; i<this.options.answers.length; i++) {
      this.options.answers[i] = {text: this.options.answers[i], correct: i===0};
    }
    // Randomize alternatives
    this.options.answers = H5P.shuffleArray(this.options.answers);
  }
  SingleChoice.prototype = Object.create(EventEmitter.prototype);
  SingleChoice.prototype.constructor = SingleChoice;

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
   SingleChoice.prototype.attach = function ($container, current) {
    var self = this;
    this.$container = $container;

    this.$choice = $('<div>', {
      'class': 'h5p-slide h5p-single-choice' + (current ? ' h5p-current' : ''),
      css: {'left': (self.index*100) + '%'}
    });

    this.$choice.append($('<div>', {
      'class': 'h5p-single-choice-question',
      'text': this.options.question
    }));

    var $alternatives = $('<ul>', {
      'class': 'h5p-single-choice-alternatives'
    });

    var handleAlternativeClick = function () {
      var $alternative = $(this);
      if($alternative.parent().hasClass('selected')) {
        return;
      }

      // Can't play it after the transition end is received, since this is not
      // accepted on iPad. Therefore we are playing it here with a delay instead
      SoundEffects.play(correct ? 'positive-short' : 'negative-short', 700);
      var correct = $(this).data('correct');
      BrowserUtils.onTransitionEnd($alternative.find('.progressbar'), function () {
        $alternative.addClass('drummed');
        self.showResult(correct);
      }, 700);

      $alternative.addClass('selected').parent().addClass('selected');
    };

    for (var i=0; i<this.options.answers.length; i++) {
      var alternative = new Alternative(this.options.answers[i]);
      alternative.attach($alternatives).on(BrowserUtils.isTouchDevice() ? 'touchstart' : 'click', handleAlternativeClick);
    }
    this.$choice.append($alternatives);
    $container.append(this.$choice);
    return this.$choice;
  };

  /**
   *
   */
   SingleChoice.prototype.showResult = function (correct) {
    var self = this;

    var $correctAlternative = self.$choice.find('.is-correct');

    BrowserUtils.onTransitionEnd($correctAlternative, function () {
      self.trigger('finished', {correct: correct});
    }, 600);

    // Find the correct one!
    self.$choice.find('.is-wrong').addClass('reveal-wrong');
    $correctAlternative.addClass('reveal-correct');
  };

  return SingleChoice;

})(H5P.jQuery, H5P.SingleChoiceEventEmitter, H5P.SingleChoiceAlternative, H5P.BrowserUtils, H5P.SoundEffects);
