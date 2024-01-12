H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};

H5P.SingleChoiceSet.SoundEffects = (function () {
  let isDefined = false;

  const SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ]
  };

  const players = {};

  /**
   * Setup defined sounds
   *
   * @param {string} libraryPath
   * @return {boolean} True if setup was successfull, otherwise false
   */
  SoundEffects.setup = function (libraryPath) {
    if (isDefined) {
      return false;
    }
    isDefined = true;

    SoundEffects.types.forEach(function (type) {
      const player = new Audio();
      player.preload = 'auto';
      const extension = player.canPlayType('audio/ogg') ? 'ogg' : 'mp3';
      player.src = libraryPath + 'sounds/' + type + '.' + extension;
      players[type] = player;
    });

    return true;
  };

  /**
   * Play a sound
   *
   * @param  {string} type  Name of the sound as defined in [SoundEffects.types]{@link H5P.SoundEffects.SoundEffects#types}
   * @param  {number} delay Delay in milliseconds
   */
  SoundEffects.play = function (type, delay) {
    if (!players[type]) {
      return;
    }

    setTimeout(function () {
      players[type].play();
    }, delay || 0);
  };

  return SoundEffects;
})();
