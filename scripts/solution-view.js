var H5P = H5P || {};
H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};

H5P.SingleChoiceSet.SolutionView = (function ($, EventDispatcher) {
  /**
  * Constructor function.
  */
  function SolutionView (id, choices, l10n){
    EventDispatcher.call(this);
    var self = this;
    self.id = id;
    this.choices = choices;

    this.$solutionView = $('<div>', {
      'class': 'h5p-sc-solution-view',
      'role': 'dialog',
      'aria-labelledby': 'single-choice-' + self.id + '-solution-title',
      'aria-describedby': 'single-choice-' + self.id + '-solution-list',
      'tabindex': 0
    });

    // Add header
    this.$header = $('<div>', {
      'class': 'h5p-sc-solution-view-header'
    }).appendTo(this.$solutionView);

    // Close solution view button
    $('<button>', {
      'role': 'button',
      'aria-label': l10n.backButtonLabel + '.',
      'class': 'h5p-joubelui-button h5p-sc-close-solution-view',
      'click': function () {
        self.hide();
      }
    }).appendTo(this.$header);

    var titleId = 'single-choice-' + self.id + '-solution-list';
    var $title = $('<div class="h5p-sc-solution-view-title" id="' + titleId + '">' + l10n.solutionViewTitle + '</div>');
    $title = this.addAriaPunctuation($title);
    this.$header.append($title);

    self.populate();
  }

  /**
   * Will append the solution view to a container DOM
   * @param  {jQuery} $container The DOM object to append to
   */
  SolutionView.prototype.appendTo = function ($container) {
    this.$solutionView.appendTo($container);
  };

  /**
   * Shows the solution view
   */
  SolutionView.prototype.show = function () {
    var self = this;
    self.$solutionView.addClass('visible');
    self.$solutionView.focus();

    $(document).on('keyup.solutionview', function (event) {
      if (event.keyCode === 27) { // Escape
        self.hide();
        $(document).off('keyup.solutionview');
      }
    });
  };

  /**
   * Hides the solution view
   */
  SolutionView.prototype.hide = function () {
    this.$solutionView.removeClass('visible');
    this.trigger('hide', this);
  };


  /**
   * Populates the solution view
   */
  SolutionView.prototype.populate = function () {
    var self = this;
    self.$choices = $('<dl>', {
      'id': 'single-choice-' + self.id + '-solution-list',
      'class': 'h5p-sc-solution-choices'
    });

    this.choices.forEach(function (choice, index) {
      if (choice.question && choice.answers && choice.answers.length !== 0) {
        var $question = self.addAriaPunctuation($('<dt>', {
          'class': 'h5p-sc-solution-question',
          html: choice.question
        }));

        self.$choices.append($question);

        var $answer = self.addAriaPunctuation($('<dd>', {
          'class': 'h5p-sc-solution-answer',
          html: choice.answers[0]
        }));

        self.$choices.append($answer);
      }
    });
    self.$choices.appendTo(this.$solutionView);
  };

  /**
   * If a jQuery elements text is missing punctuation, add an aria-label to the element
   * containing the text, and adding an extra "period"-symbol at the end.
   *
   * @private
   * @param {jQuery} $element A jQuery-element
   * @returns {jQuery} The mutated jQuery-element
   */
  SolutionView.prototype.addAriaPunctuation = function ($element) {
    var text = $element.text().trim();

    if(!this.hasPunctuation(text)) {
      $element.attr('aria-label', text + '.');
    }

    return $element;
  };

  /**
   * Checks if a string ends with punctuation
   *
   * @private
   * @param {String} text Input string
   */
  SolutionView.prototype.hasPunctuation = function (text){
    return /[,.?!]$/.test(text);
  };

  return SolutionView;
})(H5P.jQuery, H5P.EventDispatcher);
