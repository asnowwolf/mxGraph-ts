/**
 * Class: mxDictionary
 *
 * A wrapper class for an associative array with object keys. Note: This
 * implementation uses <mxObjectIdentitiy> to turn object keys into strings.
 *
 * Constructor: mxEventSource
 *
 * Constructs a new dictionary which allows object to be used as keys.
 */
export class mxDictionary {
  /**
   * Function: map
   *
   * Stores the (key, value) pairs in this dictionary.
   */
  map: any;

  /**
   * Function: clear
   *
   * Clears the dictionary.
   */
  clear(): void {
    this.map = {};
  }

  /**
   * Function: get
   *
   * Returns the value for the given key.
   */
  get(key: string): any {
    const id = mxObjectIdentity.get(key);
    return this.map[id];
  }

  /**
   * Function: put
   *
   * Stores the value under the given key and returns the previous
   * value for that key.
   */
  put(key: string, value: any): any {
    const id = mxObjectIdentity.get(key);
    const previous = this.map[id];
    this.map[id] = value;
    return previous;
  }

  /**
   * Function: remove
   *
   * Removes the value for the given key and returns the value that
   * has been removed.
   */
  remove(key: string): any {
    const id = mxObjectIdentity.get(key);
    const previous = this.map[id];
    delete this.map[id];
    return previous;
  }

  /**
   * Function: getKeys
   *
   * Returns all keys as an array.
   */
  getKeys(): any {
    const result = [];
    for (const key in this.map) {
      result.push(key);
    }
    return result;
  }

  /**
   * Function: getValues
   *
   * Returns all values as an array.
   */
  getValues(): any {
    const result = [];
    for (const key in this.map) {
      result.push(this.map[key]);
    }
    return result;
  }

  /**
   * Function: visit
   *
   * Visits all entries in the dictionary using the given function with the
   * following signature: function(key, value) where key is a string and
   * value is an object.
   *
   * Parameters:
   *
   * visitor - A function that takes the key and value as arguments.
   */
  visit(visitor: any): void {
    for (const key in this.map) {
      visitor(key, this.map[key]);
    }
  }
}
