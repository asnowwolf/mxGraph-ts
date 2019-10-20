/**
 * Class: mxMultiplicity
 *
 * Defines invalid connections along with the error messages that they produce.
 * To add or remove rules on a graph, you must add/remove instances of this
 * class to <mxGraph.multiplicities>.
 *
 * Example:
 *
 * (code)
 * graph.multiplicities.push(new mxMultiplicity(
 *   true, 'rectangle', null, null, 0, 2, ['circle'],
 *   'Only 2 targets allowed',
 *   'Only circle targets allowed'));
 * (end)
 *
 * Defines a rule where each rectangle must be connected to no more than 2
 * circles and no other types of targets are allowed.
 *
 * Constructor: mxMultiplicity
 *
 * Instantiate class mxMultiplicity in order to describe allowed
 * connections in a graph. Not all constraints can be enforced while
 * editing, some must be checked at validation time. The <countError> and
 * <typeError> are treated as resource keys in <mxResources>.
 *
 * Parameters:
 *
 * source - Boolean indicating if this rule applies to the source or target
 * terminal.
 * type - Type of the source or target terminal that this rule applies to.
 * See <type> for more information.
 * attr - Optional attribute name to match the source or target terminal.
 * value - Optional attribute value to match the source or target terminal.
 * min - Minimum number of edges for this rule. Default is 1.
 * max - Maximum number of edges for this rule. n means infinite. Default
 * is n.
 * validNeighbors - Array of types of the opposite terminal for which this
 * rule applies.
 * countError - Error to be displayed for invalid number of edges.
 * typeError - Error to be displayed for invalid opposite terminals.
 * validNeighborsAllowed - Optional boolean indicating if the array of
 * opposite types should be valid or invalid.
 */
import { mxResources } from '../util/mxResources';
import { mxUtils } from '../util/mxUtils';

export class mxMultiplicity {
  constructor(source: any, type: any, attr: any, value: any, min: any, max: any, validNeighbors: any, countError: any, typeError: any, validNeighborsAllowed: any) {
    this.source = source;
    this.type = type;
    this.attr = attr;
    this.value = value;
    this.min = (min != null) ? min : 0;
    this.max = (max != null) ? max : 'n';
    this.validNeighbors = validNeighbors;
    this.countError = mxResources.get(countError) || countError;
    this.typeError = mxResources.get(typeError) || typeError;
    this.validNeighborsAllowed = (validNeighborsAllowed != null) ? validNeighborsAllowed : true;
  }

  source: any;
  type: any;
  attr: any;
  value: any;
  min: any;
  max: any;
  validNeighbors: any;
  countError: any;
  typeError: any;
  validNeighborsAllowed: any;

  /**
   * Function: check
   *
   * Checks the multiplicity for the given arguments and returns the error
   * for the given connection or null if the multiplicity does not apply.
   *
   * Parameters:
   *
   * graph - Reference to the enclosing <mxGraph> instance.
   * edge - <mxCell> that represents the edge to validate.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   * sourceOut - Number of outgoing edges from the source terminal.
   * targetIn - Number of incoming edges for the target terminal.
   */
  check(graph: mxGraph, edge: any, source: any, target: string, sourceOut: any, targetIn: any): any {
    let error = '';
    if ((this.source && this.checkTerminal(graph, source, edge)) || (!this.source && this.checkTerminal(graph, target, edge))) {
      if (this.countError != null && ((this.source && (this.max == 0 || (sourceOut >= this.max))) || (!this.source && (this.max == 0 || (targetIn >= this.max))))) {
        error += this.countError + '\n';
      }
      if (this.validNeighbors != null && this.typeError != null && this.validNeighbors.length > 0) {
        const isValid = this.checkNeighbors(graph, edge, source, target);
        if (!isValid) {
          error += this.typeError + '\n';
        }
      }
    }
    return (error.length > 0) ? error : null;
  }

  /**
   * Function: checkNeighbors
   *
   * Checks if there are any valid neighbours in <validNeighbors>. This is only
   * called if <validNeighbors> is a non-empty array.
   */
  checkNeighbors(graph: mxGraph, edge: any, source: any, target: string): any {
    const sourceValue = graph.model.getValue(source);
    const targetValue = graph.model.getValue(target);
    let isValid = !this.validNeighborsAllowed;
    const valid = this.validNeighbors;
    for (let j = 0; j < valid.length; j++) {
      if (this.source && this.checkType(graph, targetValue, valid[j])) {
        isValid = this.validNeighborsAllowed;
        break;
      } else if (!this.source && this.checkType(graph, sourceValue, valid[j])) {
        isValid = this.validNeighborsAllowed;
        break;
      }
    }
    return isValid;
  }

  /**
   * Function: checkTerminal
   *
   * Checks the given terminal cell and returns true if this rule applies. The
   * given cell is the source or target of the given edge, depending on
   * <source>. This implementation uses <checkType> on the terminal's value.
   */
  checkTerminal(graph: mxGraph, terminal: any, edge: any): any {
    const value = graph.model.getValue(terminal);
    return this.checkType(graph, value, this.type, this.attr, this.value);
  }

  /**
   * Function: checkType
   *
   * Checks the type of the given value.
   */
  checkType(graph: mxGraph, value: any, type: any, attr: any, attrValue: any): any {
    if (value != null) {
      if (!isNaN(value.nodeType)) {
        return mxUtils.isNode(value, type, attr, attrValue);
      } else {
        return value == type;
      }
    }
    return false;
  }
}
