var H5P = H5P || {};
H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};

H5P.SingleChoiceSet.SingleChoice = (function ($, EventEmitter, Alternative, SoundEffects) {
  /**
   * Constructor function.
   */
  function SingleChoice(options, index, id) {
    EventEmitter.call(this);
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      question: '',
      answers: []
    }, options);
    // Keep provided id.
    this.index = index;
    this.id = id;

    for (var i = 0; i < this.options.answers.length; i++) {
      this.options.answers[i] = {text: this.options.answers[i], correct: i===0};
    }
    // Randomize alternatives
    this.options.answers = H5P.shuffleArray(this.options.answers);
  }
  SingleChoice.prototype = Object.create(EventEmitter.prototype);
  SingleChoice.prototype.constructor = SingleChoice;

  /**
   * appendTo function invoked to append SingleChoice to container
   *
   * @param {jQuery} $container
   */
  SingleChoice.prototype.appendTo = function ($container, isCurrent) {
    var self = this;
    this.$container = $container;

    // Index of the currently focused option.
    var focusedOption;

    this.$choice = $('<div>', {
      'class': 'h5p-sc-slide h5p-sc' + (isCurrent ? ' h5p-sc-current-slide' : ''),
      css: {'left': (self.index*100) + '%'}
    });

    var questionId = 'single-choice-' + self.id + '-question-' + self.index;

    this.$choice.append($('<div>', {
      'id' : questionId,
      'class': 'h5p-sc-question',
      'html': this.options.question
    }));

    var $alternatives = $('<ul>', {
      'class': 'h5p-sc-alternatives',
      'role': 'radiogroup',
      'aria-labelledby': questionId
    });

    /**
     * List of Alternatives
     *
     * @private
     * @type {Alternative[]}
     */
    this.alternatives = self.options.answers.map(function(opts){
      return new Alternative(opts);
    });

    /**
     * Handles click on an alternative
     */
    var handleAlternativeSelected = function (data) {
      if (data.$element.parent().hasClass('h5p-sc-selected')) {
        return;
      }

      self.trigger('alternative-selected', {
        correct: data.correct,
        index: self.index
      });

      H5P.Transition.onTransitionEnd(data.$element.find('.h5p-sc-progressbar'), function () {
        data.$element.addClass('h5p-sc-drummed');
        self.showResult(data.correct);
      }, 700);

      data.$element.addClass('h5p-sc-selected').parent().addClass('h5p-sc-selected');
    };

     /**
      * Handles focusing one of the options, making the rest non-tabbable.
      * @private
      */
     var handleFocus = function(answer, index) {
       // Keep track of currently focused option
       focusedOption = index;

       // remove tabbable for all alternatives
       this.alternatives.forEach(function(alternative){
         alternative.notTabbable();
       });

       answer.tabbable();
     };

     /**
      * Handles moving the focus from the current option to the previous option.
      * @private
      */
     var handlePreviousOption = function () {
       if (focusedOption !== 0) {
         this.focusOnAlternative(focusedOption - 1);
       }
     };

     /**
      * Handles moving the focus from the current option to the next option.
      * @private
      */
     var handleNextOption = function () {
       if (focusedOption !== this.alternatives.length - 1) {
         this.focusOnAlternative(focusedOption + 1);
       }
     };

    for (var i = 0; i < this.alternatives.length; i++) {
      var alternative = this.alternatives[i];

      if(i === 0){
        alternative.tabbable();
      }

      alternative.appendTo($alternatives);
      alternative.on('focus', handleFocus.bind(this, alternative, i), this);
      alternative.on('alternative-selected', handleAlternativeSelected, this);
      alternative.on('previousOption', handlePreviousOption, this);
      alternative.on('nextOption', handleNextOption, this);

    }

    this.$choice.append($alternatives);
    $container.append(this.$choice);
    return this.$choice;
  };

  /**
   * Focus on an alternative by index
   *
   * @param {Number} index The index of the alternative to focus on
   */
  SingleChoice.prototype.focusOnAlternative = function(index){
    this.alternatives[index].focus();
  };

  /**
   * Reveals the result for a question
   *
   * @param  {boolean} correct True uf answer was correct, otherwise false
   */
  SingleChoice.prototype.showResult = function (correct) {
    var self = this;

    var $correctAlternative = self.$choice.find('.h5p-sc-is-correct');

    H5P.Transition.onTransitionEnd($correctAlternative, function () {
      self.trigger('finished', {correct: correct});
    }, 600);

    // Reveal corrects and wrong
    self.$choice.find('.h5p-sc-is-wrong').addClass('h5p-sc-reveal-wrong');
    $correctAlternative.addClass('h5p-sc-reveal-correct');
  };

  return SingleChoice;

})(H5P.jQuery, H5P.SingleChoiceSet.EventEmitter, H5P.SingleChoiceSet.Alternative, H5P.SingleChoiceSet.SoundEffects);
