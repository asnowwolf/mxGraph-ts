/**
 * Class: mxEventObject
 *
 * The mxEventObject is a wrapper for all properties of a single event.
 * Additionally, it also offers functions to consume the event and check if it
 * was consumed as follows:
 *
 * (code)
 * evt.consume();
 * INV: evt.isConsumed() == true
 * (end)
 *
 * Constructor: mxEventObject
 *
 * Constructs a new event object with the specified name. An optional
 * sequence of key, value pairs can be appended to define properties.
 *
 * Example:
 *
 * (code)
 * new mxEventObject("eventName", key1, val1, .., keyN, valN)
 * (end)
 */
export class mxEventObject {
  name: string;
  properties: any[];
  /**
   * Variable: consumed
   *
   * Holds the consumed state. Default is false.
   */
  consumed: boolean;

  constructor(name: string) {
    this.name = name;
    this.properties = [];
    for (let i = 1; i < arguments.length; i += 2) {
      if (arguments[i + 1] != null) {
        this.properties[arguments[i]] = arguments[i + 1];
      }
    }
  }

  /**
   * Function: getName
   *
   * Returns <name>.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Function: getProperties
   *
   * Returns <properties>.
   */
  getProperties(): any {
    return this.properties;
  }

  /**
   * Function: getProperty
   *
   * Returns the property for the given key.
   */
  getProperty(key: string): any {
    return this.properties[key];
  }

  /**
   * Function: isConsumed
   *
   * Returns true if the event has been consumed.
   */
  isConsumed(): boolean {
    return this.consumed;
  }

  /**
   * Function: consume
   *
   * Consumes the event.
   */
  consume(): void {
    this.consumed = true;
  }
}
