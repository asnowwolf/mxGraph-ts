/**
 * Class: mxEventSource
 *
 * Base class for objects that dispatch named events. To create a subclass that
 * inherits from mxEventSource, the following code is used.
 *
 * (code)
 * function MyClass() { };
 *
 * MyClass.prototype = new mxEventSource();
 * MyClass.prototype.constructor = MyClass;
 * (end)
 *
 * Known Subclasses:
 *
 * <mxGraphModel>, <mxGraph>, <mxGraphView>, <mxEditor>, <mxCellOverlay>,
 * <mxToolbar>, <mxWindow>
 *
 * Constructor: mxEventSource
 *
 * Constructs a new event source.
 */
import { mxEventObject } from './mxEventObject';

export class mxEventSource {
  constructor(eventSource: any = null) {
    this.setEventSource(eventSource);
  }

  /**
   * Variable: eventListeners
   *
   * Holds the event names and associated listeners in an array. The array
   * contains the event name followed by the respective listener for each
   * registered listener.
   */
  eventListeners: any;
  /**
   * Variable: eventsEnabled
   *
   * Specifies if events can be fired. Default is true.
   * @example true
   */
  eventsEnabled: boolean = true;
  /**
   * Variable: eventSource
   *
   * Optional source for events. Default is null.
   */
  eventSource: any = true;

  /**
   * Function: isEventsEnabled
   *
   * Returns <eventsEnabled>.
   */
  isEventsEnabled(): boolean {
    return this.eventsEnabled;
  }

  /**
   * Function: setEventsEnabled
   *
   * Sets <eventsEnabled>.
   */
  setEventsEnabled(value: any): void {
    this.eventsEnabled = value;
  }

  /**
   * Function: getEventSource
   *
   * Returns <eventSource>.
   */
  getEventSource(): any {
    return this.eventSource;
  }

  /**
   * Function: setEventSource
   *
   * Sets <eventSource>.
   */
  setEventSource(value: any): void {
    this.eventSource = value;
  }

  /**
   * Function: addListener
   *
   * Binds the specified function to the given event name. If no event name
   * is given, then the listener is registered for all events.
   *
   * The parameters of the listener are the sender and an <mxEventObject>.
   */
  addListener(name: string, funct: Function): void {
    if (!this.eventListeners) {
      this.eventListeners = [];
    }
    this.eventListeners.push(name);
    this.eventListeners.push(funct);
  }

  /**
   * Function: removeListener
   *
   * Removes all occurrences of the given listener from <eventListeners>.
   */
  removeListener(funct: Function): void {
    if (!!this.eventListeners) {
      let i = 0;
      while (i < this.eventListeners.length) {
        if (this.eventListeners[i + 1] == funct) {
          this.eventListeners.splice(i, 2);
        } else {
          i += 2;
        }
      }
    }
  }

  /**
   * Function: fireEvent
   *
   * Dispatches the given event to the listeners which are registered for
   * the event. The sender argument is optional. The current execution scope
   * ("this") is used for the listener invocation (see <mxUtils.bind>).
   *
   * Example:
   *
   * (code)
   * fireEvent(new mxEventObject("eventName", key1, val1, .., keyN, valN))
   * (end)
   *
   * Parameters:
   *
   * evt - <mxEventObject> that represents the event.
   * sender - Optional sender to be passed to the listener. Default value is
   * the return value of <getEventSource>.
   */
  fireEvent(evt: mxEventObject, sender: mxEventSource | null = null): void {
    if (!!this.eventListeners && this.isEventsEnabled()) {
      if (!evt) {
        return;
      }
      if (!sender) {
        sender = this.getEventSource();
      }
      if (!sender) {
        sender = this;
      }
      const args = [sender, evt];
      for (let i = 0; i < this.eventListeners.length; i += 2) {
        const listen = this.eventListeners[i];
        if (!listen || listen == evt.getName()) {
          this.eventListeners[i + 1].apply(this, args);
        }
      }
    }
  }
}
