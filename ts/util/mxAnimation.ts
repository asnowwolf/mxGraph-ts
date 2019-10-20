/**
 * Class: mxAnimation
 *
 * Implements a basic animation in JavaScript.
 *
 * Constructor: mxAnimation
 *
 * Constructs an animation.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
export class mxAnimation {
  delay: any;
  /**
   * Variable: thread
   *
   * Reference to the thread while the animation is running.
   */
  thread: any;

  constructor(delay: any) {
    this.delay = (delay != null) ? delay : 20;
  }

  /**
   * Function: isRunning
   *
   * Returns true if the animation is running.
   */
  isRunning(): boolean {
    return this.thread != null;
  }

  /**
   * Function: startAnimation
   *
   * Starts the animation by repeatedly invoking updateAnimation.
   */
  startAnimation(): void {
    if (this.thread == null) {
      this.thread = window.setInterval(mxUtils.bind(this, this.updateAnimation), this.delay);
    }
  }

  /**
   * Function: updateAnimation
   *
   * Hook for subclassers to implement the animation. Invoke stopAnimation
   * when finished, startAnimation to resume. This is called whenever the
   * timer fires and fires an mxEvent.EXECUTE event with no properties.
   */
  updateAnimation(): void {
    this.fireEvent(new mxEventObject(mxEvent.EXECUTE));
  }

  /**
   * Function: stopAnimation
   *
   * Stops the animation by deleting the timer and fires an <mxEvent.DONE>.
   */
  stopAnimation(): void {
    if (this.thread != null) {
      window.clearInterval(this.thread);
      this.thread = null;
      this.fireEvent(new mxEventObject(mxEvent.DONE));
    }
  }
}
