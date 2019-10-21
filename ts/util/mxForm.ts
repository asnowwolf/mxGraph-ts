/**
 * Class: mxForm
 *
 * A simple class for creating HTML forms.
 *
 * Constructor: mxForm
 *
 * Creates a HTML table using the specified classname.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from './mxEvent';
import { mxResources } from './mxResources';
import { mxUtils } from './mxUtils';

export class mxForm {
  constructor(className: string) {
    this.table = document.createElement('table');
    this.table.className = className;
    this.body = document.createElement('tbody');
    this.table.appendChild(this.body);
  }

  table: boolean;
  body: any;

  /**
   * Function: getTable
   *
   * Returns the table that contains this form.
   */
  getTable(): boolean {
    return this.table;
  }

  /**
   * Function: addButtons
   *
   * Helper method to add an OK and Cancel button using the respective
   * functions.
   */
  addButtons(okFunct: any, cancelFunct: any): void {
    const tr = document.createElement('tr');
    let td = document.createElement('td');
    tr.appendChild(td);
    td = document.createElement('td');
    let button = document.createElement('button');
    mxUtils.write(button, mxResources.get('ok') || 'OK');
    td.appendChild(button);
    mxEvent.addListener(button, 'click', function () {
      okFunct();
    });
    button = document.createElement('button');
    mxUtils.write(button, mxResources.get('cancel') || 'Cancel');
    td.appendChild(button);
    mxEvent.addListener(button, 'click', function () {
      cancelFunct();
    });
    tr.appendChild(td);
    this.body.appendChild(tr);
  }

  /**
   * Function: addText
   *
   * Adds an input for the given name, type and value and returns it.
   */
  addText(name: string, value: any, type: any): any {
    const input = document.createElement('input');
    input.setAttribute('type', type || 'text');
    input.value = value;
    return this.addField(name, input);
  }

  /**
   * Function: addCheckbox
   *
   * Adds a checkbox for the given name and value and returns the textfield.
   */
  addCheckbox(name: string, value: any): any {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    this.addField(name, input);
    if (value) {
      input.checked = true;
    }
    return input;
  }

  /**
   * Function: addTextarea
   *
   * Adds a textarea for the given name and value and returns the textarea.
   */
  addTextarea(name: string, value: any, rows: any): any {
    const input = document.createElement('textarea');
    if (mxClient.IS_NS) {
      rows--;
    }
    input.setAttribute('rows', rows || 2);
    input.value = value;
    return this.addField(name, input);
  }

  /**
   * Function: addCombo
   *
   * Adds a combo for the given name and returns the combo.
   */
  addCombo(name: string, isMultiSelect: boolean, size: any): any {
    const select = document.createElement('select');
    if (!!size) {
      select.setAttribute('size', size);
    }
    if (isMultiSelect) {
      select.setAttribute('multiple', 'true');
    }
    return this.addField(name, select);
  }

  /**
   * Function: addOption
   *
   * Adds an option for the given label to the specified combo.
   */
  addOption(combo: any, label: string, value: any, isSelected: boolean): void {
    const option = document.createElement('option');
    mxUtils.writeln(option, label);
    option.setAttribute('value', value);
    if (isSelected) {
      option.setAttribute('selected', isSelected);
    }
    combo.appendChild(option);
  }

  /**
   * Function: addField
   *
   * Adds a new row with the name and the input field in two columns and
   * returns the given input.
   */
  addField(name: string, input: HTMLInputElement): any {
    const tr = document.createElement('tr');
    let td = document.createElement('td');
    mxUtils.write(td, name);
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(input);
    tr.appendChild(td);
    this.body.appendChild(tr);
    return input;
  }
}
