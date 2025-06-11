var H5P = H5P || {};
H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};
/**
 * SingleChoiceResultSlide - Represents the result slide
 */
H5P.SingleChoiceSet.ResultSlide = (function ($, EventDispatcher) {

  /**
   * @constructor
   * @param {number} maxscore Max score
   */
  function ResultSlide(maxscore) {
    EventDispatcher.call(this);

    this.$resultSlide = $('<div>', {
      'class': 'h5p-sc-slide h5p-sc-set-results',
      'css': {left: (maxscore * 100) + '%'}
    });

    this.$buttonContainer = $('<div/>', {
      'class': 'h5p-sc-button-container'
    }).appendTo(this.$resultSlide);

    this.component;
    this.header;
  }

  // inherits from EventDispatchers prototype
  ResultSlide.prototype = Object.create(EventDispatcher.prototype);

  // set the constructor
  ResultSlide.prototype.constructor = ResultSlide;

  /**
   * Focus the header, in case there are no buttons
   */
  ResultSlide.prototype.focusScore = function () {
    this.header?.focus();
  };

  /**
   * Show the result slide, with updated results
   */
  ResultSlide.prototype.showSlide = function (params) {
    if(this.component) {
      this.component.remove();
    }

    this.component = H5P.Components.ResultScreen({
      header: 'TEST',
      scoreHeader: 'Score test',
      questionGroups: [{
        listHeaders: [ 'Question TEST', 'Score TEST' ],
        questions: [
          {
            title: 'task 1',
            points: '1/4',
          },
          {
            title: 'task 2',
            points: '1/4',
          },
          {
            title: 'task 3',
            points: '1/4',
          },
        ]
      }]
    });

    this.$resultSlide[0].prepend(this.component);

    this.header = this.component.querySelector('.h5p-theme-results-banner');
    this.header.tabindex = -1;
  };

  /**
   * Append the resultslide to a container
   *
   * @param  {jQuery} $container The container
   * @return {jQuery}            This dom element
   */
  ResultSlide.prototype.appendTo = function ($container) {
    this.$resultSlide.appendTo($container);
    return this.$resultSlide;
  };

  return ResultSlide;
})(H5P.jQuery, H5P.EventDispatcher);
