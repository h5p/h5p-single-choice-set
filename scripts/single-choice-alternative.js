var H5P = H5P || {};

H5P.SingleChoiceAlternative = (function ($) {

  /**
  * @constructor
  *
  * @param {object} options Options for the alternative
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

  /**
   * Is this alternative the correct one?
   *
   * @return {boolean}  Correct or not?
   */
  Alternative.prototype.isCorrect = function () {
    return this.options.correct;
  };


  /**
   * Attach the alternative to a DOM container
   *
   * @param  {domElement} $container The Dom element to attach to
   * @return {domElement}            This dom element
   */
  Alternative.prototype.attach = function ($container) {
    var self = this;
    $container.append(this.$alternative);
    return this.$alternative;
  };

  return Alternative;

})(H5P.jQuery);
