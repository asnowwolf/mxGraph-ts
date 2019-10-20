/**
 * Class: mxUndoableEdit
 *
 * Implements a composite undoable edit. Here is an example for a custom change
 * which gets executed via the model:
 *
 * (code)
 * function CustomChange(model, name)
 * {
 *   this.model = model;
 *   this.name = name;
 *   this.previous = name;
 * };
 *
 * CustomChange.prototype.execute = function()
 * {
 *   var tmp = this.model.name;
 *   this.model.name = this.previous;
 *   this.previous = tmp;
 * };
 *
 * var name = prompt('Enter name');
 * graph.model.execute(new CustomChange(graph.model, name));
 * (end)
 *
 * Event: mxEvent.EXECUTED
 *
 * Fires between START_EDIT and END_EDIT after an atomic change was executed.
 * The <code>change</code> property contains the change that was executed.
 *
 * Event: mxEvent.START_EDIT
 *
 * Fires before a set of changes will be executed in <undo> or <redo>.
 * This event contains no properties.
 *
 * Event: mxEvent.END_EDIT
 *
 * Fires after a set of changeswas executed in <undo> or <redo>.
 * This event contains no properties.
 *
 * Constructor: mxUndoableEdit
 *
 * Constructs a new undoable edit for the given source.
 */
export class mxUndoableEdit {
  source: any;
  changes: any[];
  significant: any;
  /**
   * Variable: undone
   *
   * Specifies if this edit has been undone. Default is false.
   */
  undone: boolean;
  /**
   * Variable: redone
   *
   * Specifies if this edit has been redone. Default is false.
   */
  redone: boolean;

  constructor(source: any, significant: any) {
    this.source = source;
    this.changes = [];
    this.significant = (significant != null) ? significant : true;
  }

  /**
   * Function: isEmpty
   *
   * Returns true if the this edit contains no changes.
   */
  isEmpty(): boolean {
    return this.changes.length == 0;
  }

  /**
   * Function: isSignificant
   *
   * Returns <significant>.
   */
  isSignificant(): boolean {
    return this.significant;
  }

  /**
   * Function: add
   *
   * Adds the specified change to this edit. The change is an object that is
   * expected to either have an undo and redo, or an execute function.
   */
  add(change: any): void {
    this.changes.push(change);
  }

  /**
   * Function: notify
   *
   * Hook to notify any listeners of the changes after an <undo> or <redo>
   * has been carried out. This implementation is empty.
   */
  notify(): void {
  }

  /**
   * Function: die
   *
   * Hook to free resources after the edit has been removed from the command
   * history. This implementation is empty.
   */
  die(): void {
  }

  /**
   * Function: undo
   *
   * Undoes all changes in this edit.
   */
  undo(): void {
    if (!this.undone) {
      this.source.fireEvent(new mxEventObject(mxEvent.START_EDIT));
      const count = this.changes.length;
      for (let i = count - 1; i >= 0; i--) {
        const change = this.changes[i];
        if (change.execute != null) {
          change.execute();
        } else if (change.undo != null) {
          change.undo();
        }
        this.source.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
      }
      this.undone = true;
      this.redone = false;
      this.source.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }
    this.notify();
  }

  /**
   * Function: redo
   *
   * Redoes all changes in this edit.
   */
  redo(): void {
    if (!this.redone) {
      this.source.fireEvent(new mxEventObject(mxEvent.START_EDIT));
      const count = this.changes.length;
      for (let i = 0; i < count; i++) {
        const change = this.changes[i];
        if (change.execute != null) {
          change.execute();
        } else if (change.redo != null) {
          change.redo();
        }
        this.source.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
      }
      this.undone = false;
      this.redone = true;
      this.source.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }
    this.notify();
  }
}
