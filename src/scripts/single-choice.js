import { jQuery as $, EventDispatcher, shuffleArray } from "./globals";
import Controls from 'h5p-lib-controls/src/scripts/controls';
import UIKeyboard from 'h5p-lib-controls/src/scripts/ui/keyboard';

export default class SingleChoice extends EventDispatcher {
  /**
   * Constructor function.
   * @constructor
   * @param {object} options
   * @param {number} index
   * @param {number} id
   * @param {boolean} autoCheck
   */
  constructor (options, index, id, autoCheck) {
    super();

    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      question: '',
      answers: []
    }, options);
    // Keep provided id.
    this.index = index;
    this.id = id;
    this.answered = false;
    /**
     * @type {boolean}
     */
    this.autoCheck = autoCheck;

    // add keyboard controls
    this.controls = new Controls([new UIKeyboard()]);
    this.controls.on('select', this.handleAlternativeSelected, this);

    // create config
    this.options.answers = shuffleArray(this.options.answers.map((answer, index) => ({
      text: this.options.answers[index],
      correct: index === 0,
      answerIndex: index
    })));
  }

  /**
   * appendTo function invoked to append SingleChoice to container
   *
   * @param {jQuery} $container
   * @param {boolean} isCurrent Current slide we are on
   */
  appendTo ($container, isCurrent) {
    const questionId = `single-choice-${this.id}-question-${this.index}`;
    this.$container = $container;

    this.$choice = $('<div>', {
      'class': 'h5p-sc-slide h5p-sc' + (isCurrent ? ' h5p-sc-current-slide' : ''),
      css: {'left': (this.index * 100) + '%'}
    });

    this.$choice.append($('<div>', {
      'id': questionId,
      'class': 'h5p-sc-question',
      'html': this.options.question
    }));

    var $alternatives = $('<ul>', {
      'class': 'h5p-sc-alternatives',
      'role': 'radiogroup',
      'aria-labelledby': questionId
    });

    this.$nextButton = $('<button>', {
      html: 'Next',
      'class': 'h5p-joubelui-button h5p-question-next',
      'aria-disabled': 'true',
      'tabindex': '-1',
      'click': () => {
        if(this.$nextButton.attr('aria-disabled') !== 'true') {
          this.toggleNextButton(false);
          this.checkAnswer();
        }
      }
    }).toggle(!this.autoCheck);

    this.alternativeElements = this.options.answers.map(opts => this.createAlternativeElement(opts));

    $alternatives.append(this.alternativeElements);

    this.$choice.append($alternatives);
    this.$choice.append(this.$nextButton);
    $container.append(this.$choice);
    return this.$choice;
  };

  /**
   * Focus on an alternative by index
   *
   * @param {Number} index The index of the alternative to focus on
   */
  focusOnAlternative (index) {
    if (!this.answered) {
      this.controls.setTabbableByIndex(index);
      this.$choice.find('[tabindex="0"]').focus();
    }
  };

  /**
   * Handles selection an alternative
   *
   * @param {Element} element
   * @param {number} index
   */
  handleAlternativeSelected ({ element }) {
    const $element = $(element);
    this.selectedElement = element;

    // sets aria selected on this element
    this.alternativeElements.forEach((el) => {
      el.setAttribute('aria-selected', element.isEqualNode(el).toString());
    });

    if (this.autoCheck && !$element.parent().hasClass('h5p-sc-selected')) {
      $element.addClass('h5p-sc-selected').parent().addClass('h5p-sc-selected');
      this.checkAnswer();
    }
    else {
      this.toggleNextButton();
    }
  }

  /**
   * Enables the next button
   *
   * @param {boolean} [enable]
   */
  toggleNextButton(enable = true) {
    this.$nextButton.attr('aria-disabled', (!enable).toString());
    this.$nextButton.attr('tabindex', enable ? '0' : '-1');
  }

  /**
   * Checks if it's the correct answer
   */
  checkAnswer() {
    const $element = $(this.selectedElement);
    const index = this.alternativeElements.indexOf(this.selectedElement);
    const correct = this.options.answers[index].correct;

    H5P.Transition.onTransitionEnd($element.find('.h5p-sc-progressbar'), () => {
      $element.addClass('h5p-sc-drummed');
      this.showResult(correct, index);
    }, 700);

    // indicate that this question is answered
    this.answered = true;

    // trigger event
    this.trigger('alternative-selected', {
      correct: correct,
      $element: $element,
      answerIndex: index
    });
  }

  /**
   * Sets if the question was answered
   *
   * @param {Boolean} answered If this question was answered
   */
  setAnswered (answered) {
    this.answered = answered;
  }

  /**
   * Creates an alternative
   *
   * @param {Object} options
   * @return {Element}
   */
  createAlternativeElement (options) {
    const element = document.createElement('li');
    element.className = 'h5p-sc-alternative h5p-sc-is-' + (options.correct ? 'correct' : 'wrong');
    element.setAttribute('role', 'radio');
    element.innerHTML =
      `<div class="h5p-sc-progressbar"></div>
       <div class="h5p-sc-label">${options.text}</div>
       <div class="h5p-sc-status"></div>`;

    // Add keyboard controls
    this.controls.addElement(element);

    element.addEventListener('click', () => {
      this.handleAlternativeSelected({ element })
    });

    return element;
  }

  /**
   * Reveals the result for a question
   *
   * @param  {boolean} correct True uf answer was correct, otherwise false
   * @param  {number} answerIndex Original index of answer
   */
  showResult (correct, answerIndex) {
    var $correctAlternative = this.$choice.find('.h5p-sc-is-correct');

    H5P.Transition.onTransitionEnd($correctAlternative, () => {
      this.trigger('finished', {
        correct: correct,
        index: this.index,
        answerIndex: answerIndex
      });
    }, 600);

    // Reveal corrects and wrong
    this.$choice.find('.h5p-sc-is-wrong').addClass('h5p-sc-reveal-wrong');
    $correctAlternative.addClass('h5p-sc-reveal-correct');
  }
}
