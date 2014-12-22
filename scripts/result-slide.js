var H5P = H5P || {};

H5P.SingleChoiceResultSlide = (function ($, EventEmitter) {

  function ResultSlide(maxscore, showSolutionEnabled, retryEnabled) {
    EventEmitter.call(this);
    this.maxscore = maxscore;
    var self = this;

    this.$resultSlide = $('<div>', {
      'class': 'h5p-slide h5p-single-choice-set-results',
      'css': {left: (maxscore*100) + '%'}
    }).append(
      '<span class="feedback">You got <span class="score">?</span> of ' + maxscore + ' correct</span>'
    );

    if (showSolutionEnabled) {
      this.$resultSlide.append($('<button>', {
        'class': 'h5p-button show-solution',
        'text': 'Show solution',
        'click': function () {
          //alert('Solution view not implemented yet');
          self.trigger('view-solution');
        }
      }));
    }

    if (retryEnabled) {
      this.$resultSlide.append($('<button>', {
        'class': 'h5p-button retry',
        'text': 'Retry',
        'click': function () {
          self.trigger('retry');
        }
      }));
    }
  }
  ResultSlide.prototype = Object.create(EventEmitter.prototype);
  ResultSlide.prototype.constructor = ResultSlide;

  ResultSlide.prototype.attach = function ($container) {
    this.$resultSlide.appendTo($container);
    return this.$resultSlide;
  };

  ResultSlide.prototype.setScore = function (result) {
    this.$resultSlide.find('.score').text(result);
  };

  ResultSlide.prototype.getSolutionButton = function () {
    return this.$resultSlide.find('.h5p-button.show-solution');
  };

  return ResultSlide;

})(H5P.jQuery, H5P.SingleChoiceEventEmitter);
