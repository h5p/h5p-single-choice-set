import { jQuery as $, EventDispatcher } from "./globals";

export default class SolutionView extends EventDispatcher {
  /**
   * Constructor function.
   */
  constructor(id, choices, l10n) {
    super();
    var self = this;
    self.id = id;
    this.choices = choices;

    this.$solutionView = $('<div>', {
      'class': 'h5p-sc-solution-view'
    });

    // Add header
    this.$header = $('<div>', {
      'class': 'h5p-sc-solution-view-header'
    }).appendTo(this.$solutionView);

    this.$title = $('<div>', {
      'class': 'h5p-sc-solution-view-title',
      'html': l10n.solutionViewTitle,
      'tabindex': '-1'
    });
    this.$title = this.addAriaPunctuation(this.$title);
    this.$header.append(this.$title);

    // Close solution view button
    $('<button>', {
      'role': 'button',
      'aria-label': l10n.closeButtonLabel + '.',
      'class': 'h5p-joubelui-button h5p-sc-close-solution-view',
      'click': function () {
        self.hide();
      }
    }).appendTo(this.$header);

    self.populate();
  }

  /**
   * Add a new event listener
   *
   * @param {string} type
   * @param {function} listener
   * @param {*} [instance]
   */
  on(type, listener, instance) {
    this.on(type, listener, instance);
  }

  /**
   * Will append the solution view to a container DOM
   * @param  {jQuery} $container The DOM object to append to
   */
  appendTo ($container) {
    this.$solutionView.appendTo($container);
  };

  /**
   * Shows the solution view
   */
  show () {
    var self = this;
    self.$solutionView.addClass('visible');
    self.$title.focus();

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
  hide () {
    this.$solutionView.removeClass('visible');
    this.trigger('hide', this);
  };


  /**
   * Populates the solution view
   */
  populate () {
    var self = this;
    self.$choices = $('<dl>', {
      'class': 'h5p-sc-solution-choices',
      'tabindex': -1,
    });

    this.choices.forEach(function (choice) {
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
   * @param {jQuery} $element A jQuery-element
   * @returns {jQuery} The mutated jQuery-element
   */
  addAriaPunctuation ($element) {
    var text = $element.text().trim();

    if (!this.hasPunctuation(text)) {
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
  hasPunctuation (text) {
    return /[,.?!]$/.test(text);
  };

}
