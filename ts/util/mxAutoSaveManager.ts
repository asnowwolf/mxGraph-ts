/**
 * Class: mxAutoSaveManager
 *
 * Manager for automatically saving diagrams. The <save> hook must be
 * implemented.
 *
 * Example:
 *
 * (code)
 * var mgr = new mxAutoSaveManager(editor.graph);
 * mgr.save = function()
 * {
 *   mxLog.show();
 *   mxLog.debug('save');
 * };
 * (end)
 *
 * Constructor: mxAutoSaveManager
 *
 * Constructs a new automatic layout for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 */
import { mxEvent } from './mxEvent';
import { mxUtils } from './mxUtils';

export class mxAutoSaveManager {
  constructor(graph: mxGraph) {
    this.changeHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled()) {
        this.graphModelChanged(evt.getProperty('edit').changes);
      }
    });
    this.setGraph(graph);
  }

  changeHandler: Function;
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph;
  /**
   * Variable: autoSaveDelay
   *
   * Minimum amount of seconds between two consecutive autosaves. Eg. a
   * value of 1 (s) means the graph is not stored more than once per second.
   * Default is 10.
   * @example 10
   */
  autoSaveDelay: number;
  /**
   * Variable: autoSaveThrottle
   *
   * Minimum amount of seconds between two consecutive autosaves triggered by
   * more than <autoSaveThreshhold> changes within a timespan of less than
   * <autoSaveDelay> seconds. Eg. a value of 1 (s) means the graph is not
   * stored more than once per second even if there are more than
   * <autoSaveThreshold> changes within that timespan. Default is 2.
   * @example 2
   */
  autoSaveThrottle: number;
  /**
   * Variable: autoSaveThreshold
   *
   * Minimum amount of ignored changes before an autosave. Eg. a value of 2
   * means after 2 change of the graph model the autosave will trigger if the
   * condition below is true. Default is 5.
   * @example 5
   */
  autoSaveThreshold: number;
  /**
   * Variable: ignoredChanges
   *
   * Counter for ignored changes in autosave.
   */
  ignoredChanges: number;
  /**
   * Variable: lastSnapshot
   *
   * Used for autosaving. See <autosave>.
   */
  lastSnapshot: number;
  /**
   * Variable: enabled
   *
   * Specifies if event handling is enabled. Default is true.
   * @example true
   */
  enabled: boolean;

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(value: any): void {
    this.enabled = value;
  }

  /**
   * Function: setGraph
   *
   * Sets the graph that the layouts operate on.
   */
  setGraph(graph: mxGraph): void {
    if (this.graph != null) {
      this.graph.getModel().removeListener(this.changeHandler);
    }
    this.graph = graph;
    if (this.graph != null) {
      this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
    }
  }

  /**
   * Function: save
   *
   * Empty hook that is called if the graph should be saved.
   */
  save(): void {
  }

  /**
   * Function: graphModelChanged
   *
   * Invoked when the graph model has changed.
   */
  graphModelChanged(changes: any): void {
    const now = new Date().getTime();
    const dt = (now - this.lastSnapshot) / 1000;
    if (dt > this.autoSaveDelay || (this.ignoredChanges >= this.autoSaveThreshold && dt > this.autoSaveThrottle)) {
      this.save();
      this.reset();
    } else {
      this.ignoredChanges++;
    }
  }

  /**
   * Function: reset
   *
   * Resets all counters.
   */
  reset(): void {
    this.lastSnapshot = new Date().getTime();
    this.ignoredChanges = 0;
  }

  /**
   * Function: destroy
   *
   * Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy(): void {
    this.setGraph(null);
  }
}
