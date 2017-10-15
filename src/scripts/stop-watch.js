export default class StopWatch {
  constructor() {
    /**
     * @property {number} duration in ms
     */
    this.duration = 0;
  }

  /**
   * Starts the stop watch
   *
   * @public
   * @return {StopWatch}
   */
  start(){
    /**
     * @property {number}
     */
    this.startTime = Date.now();
    return this;
  };

  /**
   * Stops the stopwatch, and returns the duration in seconds.
   *
   * @public
   * @return {number}
   */
  stop() {
    this.duration = this.duration + Date.now() - this.startTime;
    return this.passedTime();
  };

  /**
   * Sets the duration to 0
   *
   * @public
   */
  reset() {
    this.duration = 0;
  };

  /**
   * Returns the passed time in seconds
   *
   * @public
   * @return {number}
   */
  passedTime() {
    return Math.round(this.duration / 10) / 100;
  };
};
