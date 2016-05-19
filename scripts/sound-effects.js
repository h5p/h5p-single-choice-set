H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};

H5P.SingleChoiceSet.SoundEffects = (function ($) {
  var isDefined = false;

  SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ],
    libraryPath: undefined
  };

  /**
   * Setup defined sounds
   *
   * @return {boolean} True if setup was successfull, otherwise false
   */
  SoundEffects.setup = function () {
    if (isDefined || !H5P.SoundJS.initializeDefaultPlugins()) {
      return false;
    }

    SoundEffects.libraryPath = H5P.getLibraryPath('H5P.SingleChoiceSet-1.3');
    H5P.SoundJS.alternateExtensions = ['mp3'];
    for (var i = 0; i < SoundEffects.types.length; i++) {
      var type = SoundEffects.types[i];
      H5P.SoundJS.registerSound(SoundEffects.libraryPath + '/sounds/' + type + '.ogg', type);
    }
    isDefined = true;

    return true;
  };

  /**
   * Play a sound
   *
   * @param  {string} type  Name of the sound as defined in [SoundEffects.types]{@link H5P.SoundEffects.SoundEffects#types}
   * @param  {number} delay Delay in milliseconds
   */
  SoundEffects.play = function (type, delay) {
    H5P.SoundJS.play(type, H5P.SoundJS.INTERRUPT_NONE, (delay || 0));
  };

  return SoundEffects;
})(H5P.jQuery);
