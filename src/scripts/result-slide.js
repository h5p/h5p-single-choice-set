import { jQuery as $, EventDispatcher } from "./globals";

/**
 * SingleChoiceResultSlide - Represents the result slide
 */
export default class ResultSlide extends EventDispatcher {
  /**
   * @param {number} maxscore Max score
   */
  constructor (maxscore) {
    super();
    this.$feedbackContainer = $('<div>', {
      'class': 'h5p-sc-feedback-container',
      'tabindex': '-1'
    });

    this.$buttonContainer = $('<div/>', {
      'class': 'h5p-sc-button-container'
    });

    var $resultContainer = $('<div/>', {
      'class': 'h5p-sc-result-container'
    }).append(this.$feedbackContainer)
      .append(this.$buttonContainer);

    this.$resultSlide = $('<div>', {
      'class': 'h5p-sc-slide h5p-sc-set-results',
      'css': {left: (maxscore * 100) + '%'}
    }).append($resultContainer);
  }

  /**
   * Focus feedback container.
   */
  focusScore () {
    this.$feedbackContainer.focus();
  };

  /**
   * Append the resultslide to a container
   *
   * @param  {jQuery} $container The container
   * @return {jQuery}            This dom element
   */
  appendTo ($container) {
    this.$resultSlide.appendTo($container);
    return this.$resultSlide;
  };
};
