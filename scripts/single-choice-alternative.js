var H5P = H5P || {};

H5P.SingleChoiceAlternative = (function ($) {

  /**
  *
  */
  function Alternative(options){
    this.options = options;

    this.$alternative = $('<li>', {
      'class': 'h5p-single-choice-alternative is-' + (this.options.correct ? 'correct' : 'wrong')
    });

    this.$alternative.append($('<div>', {
      'class': 'progressbar'
    }));

    this.$alternative.append($('<div>', {
      'class': 'label',
      'text': this.options.text
    }));

    this.$alternative.append($('<div>', {
      'class': 'status'
    }));
  }

  Alternative.prototype.isCorrect = function () {
    return this.options.correct;
  };

  /**
  *
  */
  Alternative.prototype.attach = function ($container) {
    var self = this;
    $container.append(this.$alternative);

    /*this.$alternative.on('click', function() {
    $container.trigger('answer-selected', {correct: self.options.correct});
    return false;
    });*/

    return this.$alternative;
  };

  return Alternative;

})(H5P.jQuery);
