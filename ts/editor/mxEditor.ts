/**
 * Class: mxEditor
 *
 * Extends <mxEventSource> to implement a application wrapper for a graph that
 * adds <actions>, I/O using <mxCodec>, auto-layout using <mxLayoutManager>,
 * command history using <undoManager>, and standard dialogs and widgets, eg.
 * properties, help, outline, toolbar, and popupmenu. It also adds <templates>
 * to be used as cells in toolbars, auto-validation using the <validation>
 * flag, attribute cycling using <cycleAttributeValues>, higher-level events
 * such as <root>, and backend integration using <urlPost> and <urlImage>.
 *
 * Actions:
 *
 * Actions are functions stored in the <actions> array under their names. The
 * functions take the <mxEditor> as the first, and an optional <mxCell> as the
 * second argument and are invoked using <execute>. Any additional arguments
 * passed to execute are passed on to the action as-is.
 *
 * A list of built-in actions is available in the <addActions> description.
 *
 * Read/write Diagrams:
 *
 * To read a diagram from an XML string, for example from a textfield within the
 * page, the following code is used:
 *
 * (code)
 * var doc = mxUtils.parseXML(xmlString);
 * var node = doc.documentElement;
 * editor.readGraphModel(node);
 * (end)
 *
 * For reading a diagram from a remote location, use the <open> method.
 *
 * To save diagrams in XML on a server, you can set the <urlPost> variable.
 * This variable will be used in <getUrlPost> to construct a URL for the post
 * request that is issued in the <save> method. The post request contains the
 * XML representation of the diagram as returned by <writeGraphModel> in the
 * xml parameter.
 *
 * On the server side, the post request is processed using standard
 * technologies such as Java Servlets, CGI, .NET or ASP.
 *
 * Here are some examples of processing a post request in various languages.
 *
 * - Java: URLDecoder.decode(request.getParameter("xml"), "UTF-8").replace("\n", "&#xa;")
 *
 * Note that the linefeeds should only be replaced if the XML is
 * processed in Java, for example when creating an image, but not
 * if the XML is passed back to the client-side.
 *
 * - .NET: HttpUtility.UrlDecode(context.Request.Params["xml"])
 * - PHP: urldecode($_POST["xml"])
 *
 * Creating images:
 *
 * A backend (Java, PHP or C#) is required for creating images. The
 * distribution contains an example for each backend (ImageHandler.java,
 * ImageHandler.cs and graph.php). More information about using a backend
 * to create images can be found in the readme.html files. Note that the
 * preview is implemented using VML/SVG in the browser and does not require
 * a backend. The backend is only required to creates images (bitmaps).
 *
 * Special characters:
 *
 * Note There are five characters that should always appear in XML content as
 * escapes, so that they do not interact with the syntax of the markup. These
 * are part of the language for all documents based on XML and for HTML.
 *
 * - &lt; (<)
 * - &gt; (>)
 * - &amp; (&)
 * - &quot; (")
 * - &apos; (')
 *
 * Although it is part of the XML language, &apos; is not defined in HTML.
 * For this reason the XHTML specification recommends instead the use of
 * &#39; if text may be passed to a HTML user agent.
 *
 * If you are having problems with special characters on the server-side then
 * you may want to try the <escapePostData> flag.
 *
 * For converting decimal escape sequences inside strings, a user has provided
 * us with the following function:
 *
 * (code)
 * function html2js(text)
 * {
 *   var entitySearch = /&#[0-9]+;/;
 *   var entity;
 *
 *   while (entity = entitySearch.exec(text))
 *   {
 *     var charCode = entity[0].substring(2, entity[0].length -1);
 *     text = text.substring(0, entity.index)
 *            + String.fromCharCode(charCode)
 *            + text.substring(entity.index + entity[0].length);
 *   }
 *
 *   return text;
 * }
 * (end)
 *
 * Otherwise try using hex escape sequences and the built-in unescape function
 * for converting such strings.
 *
 * Local Files:
 *
 * For saving and opening local files, no standardized method exists that
 * works across all browsers. The recommended way of dealing with local files
 * is to create a backend that streams the XML data back to the browser (echo)
 * as an attachment so that a Save-dialog is displayed on the client-side and
 * the file can be saved to the local disk.
 *
 * For example, in PHP the code that does this looks as follows.
 *
 * (code)
 * $xml = stripslashes($_POST["xml"]);
 * header("Content-Disposition: attachment; filename=\"diagram.xml\"");
 * echo($xml);
 * (end)
 *
 * To open a local file, the file should be uploaded via a form in the browser
 * and then opened from the server in the editor.
 *
 * Cell Properties:
 *
 * The properties displayed in the properties dialog are the attributes and
 * values of the cell's user object, which is an XML node. The XML node is
 * defined in the templates section of the config file.
 *
 * The templates are stored in <mxEditor.templates> and contain cells which
 * are cloned at insertion time to create new vertices by use of drag and
 * drop from the toolbar. Each entry in the toolbar for adding a new vertex
 * must refer to an existing template.
 *
 * In the following example, the task node is a business object and only the
 * mxCell node and its mxGeometry child contain graph information:
 *
 * (code)
 * <Task label="Task" description="">
 *   <mxCell vertex="true">
 *     <mxGeometry as="geometry" width="72" height="32"/>
 *   </mxCell>
 * </Task>
 * (end)
 *
 * The idea is that the XML representation is inverse from the in-memory
 * representation: The outer XML node is the user object and the inner node is
 * the cell. This means the user object of the cell is the Task node with no
 * children for the above example:
 *
 * (code)
 * <Task label="Task" description=""/>
 * (end)
 *
 * The Task node can have any tag name, attributes and child nodes. The
 * <mxCodec> will use the XML hierarchy as the user object, while removing the
 * "known annotations", such as the mxCell node. At save-time the cell data
 * will be "merged" back into the user object. The user object is only modified
 * via the properties dialog during the lifecycle of the cell.
 *
 * In the default implementation of <createProperties>, the user object's
 * attributes are put into a form for editing. Attributes are changed using
 * the <mxCellAttributeChange> action in the model. The dialog can be replaced
 * by overriding the <createProperties> hook or by replacing the showProperties
 * action in <actions>. Alternatively, the entry in the config file's popupmenu
 * section can be modified to invoke a different action.
 *
 * If you want to displey the properties dialog on a doubleclick, you can set
 * <mxEditor.dblClickAction> to showProperties as follows:
 *
 * (code)
 * editor.dblClickAction = 'showProperties';
 * (end)
 *
 * Popupmenu and Toolbar:
 *
 * The toolbar and popupmenu are typically configured using the respective
 * sections in the config file, that is, the popupmenu is defined as follows:
 *
 * (code)
 * <mxEditor>
 *   <mxDefaultPopupMenu as="popupHandler">
 *    <add as="cut" action="cut" icon="images/cut.gif"/>
 *      ...
 * (end)
 *
 * New entries can be added to the toolbar by inserting an add-node into the
 * above configuration. Existing entries may be removed and changed by
 * modifying or removing the respective entries in the configuration.
 * The configuration is read by the <mxDefaultPopupMenuCodec>, the format of the
 * configuration is explained in <mxDefaultPopupMenu.decode>.
 *
 * The toolbar is defined in the mxDefaultToolbar section. Items can be added
 * and removed in this section.
 *
 * (code)
 * <mxEditor>
 *   <mxDefaultToolbar>
 *     <add as="save" action="save" icon="images/save.gif"/>
 *     <add as="Swimlane" template="swimlane" icon="images/swimlane.gif"/>
 *     ...
 * (end)
 *
 * The format of the configuration is described in
 * <mxDefaultToolbarCodec.decode>.
 *
 * Ids:
 *
 * For the IDs, there is an implicit behaviour in <mxCodec>: It moves the Id
 * from the cell to the user object at encoding time and vice versa at decoding
 * time. For example, if the Task node from above has an id attribute, then
 * the <mxCell.id> of the corresponding cell will have this value. If there
 * is no Id collision in the model, then the cell may be retrieved using this
 * Id with the <mxGraphModel.getCell> function. If there is a collision, a new
 * Id will be created for the cell using <mxGraphModel.createId>. At encoding
 * time, this new Id will replace the value previously stored under the id
 * attribute in the Task node.
 *
 * See <mxEditorCodec>, <mxDefaultToolbarCodec> and <mxDefaultPopupMenuCodec>
 * for information about configuring the editor and user interface.
 *
 * Programmatically inserting cells:
 *
 * For inserting a new cell, say, by clicking a button in the document,
 * the following code can be used. This requires an reference to the editor.
 *
 * (code)
 * var userObject = new Object();
 * var parent = editor.graph.getDefaultParent();
 * var model = editor.graph.model;
 * model.beginUpdate();
 * try
 * {
 *   editor.graph.insertVertex(parent, null, userObject, 20, 20, 80, 30);
 * }
 * finally
 * {
 *   model.endUpdate();
 * }
 * (end)
 *
 * If a template cell from the config file should be inserted, then a clone
 * of the template can be created as follows. The clone is then inserted using
 * the add function instead of addVertex.
 *
 * (code)
 * var template = editor.templates['task'];
 * var clone = editor.graph.model.cloneCell(template);
 * (end)
 *
 * Resources:
 *
 * resources/editor - Language resources for mxEditor
 *
 * Callback: onInit
 *
 * Called from within the constructor. In the callback,
 * "this" refers to the editor instance.
 *
 * Cookie: mxgraph=seen
 *
 * Set when the editor is started. Never expires. Use
 * <resetFirstTime> to reset this cookie. This cookie
 * only exists if <onInit> is implemented.
 *
 * Event: mxEvent.OPEN
 *
 * Fires after a file was opened in <open>. The <code>filename</code> property
 * contains the filename that was used. The same value is also available in
 * <filename>.
 *
 * Event: mxEvent.SAVE
 *
 * Fires after the current file was saved in <save>. The <code>url</code>
 * property contains the URL that was used for saving.
 *
 * Event: mxEvent.POST
 *
 * Fires if a successful response was received in <postDiagram>. The
 * <code>request</code> property contains the <mxXmlRequest>, the
 * <code>url</code> and <code>data</code> properties contain the URL and the
 * data that were used in the post request.
 *
 * Event: mxEvent.ROOT
 *
 * Fires when the current root has changed, or when the title of the current
 * root has changed. This event has no properties.
 *
 * Event: mxEvent.BEFORE_ADD_VERTEX
 *
 * Fires before a vertex is added in <addVertex>. The <code>vertex</code>
 * property contains the new vertex and the <code>parent</code> property
 * contains its parent.
 *
 * Event: mxEvent.ADD_VERTEX
 *
 * Fires between begin- and endUpdate in <addVertex>. The <code>vertex</code>
 * property contains the vertex that is being inserted.
 *
 * Event: mxEvent.AFTER_ADD_VERTEX
 *
 * Fires after a vertex was inserted and selected in <addVertex>. The
 * <code>vertex</code> property contains the new vertex.
 *
 * Example:
 *
 * For starting an in-place edit after a new vertex has been added to the
 * graph, the following code can be used.
 *
 * (code)
 * editor.addListener(mxEvent.AFTER_ADD_VERTEX, function(sender, evt)
 * {
 *   var vertex = evt.getProperty('vertex');
 *
 *   if (editor.graph.isCellEditable(vertex))
 *   {
 *   	editor.graph.startEditingAtCell(vertex);
 *   }
 * });
 * (end)
 *
 * Event: mxEvent.ESCAPE
 *
 * Fires when the escape key is pressed. The <code>event</code> property
 * contains the key event.
 *
 * Constructor: mxEditor
 *
 * Constructs a new editor. This function invokes the <onInit> callback
 * upon completion.
 *
 * Example:
 *
 * (code)
 * var config = mxUtils.load('config/diagrameditor.xml').getDocumentElement();
 * var editor = new mxEditor(config);
 * (end)
 *
 * Parameters:
 *
 * config - Optional XML node that contains the configuration.
 */
import { mxGraphHandler } from '../handler/mxGraphHandler';
import { mxRubberband } from '../handler/mxRubberband';
import { mxCodec } from '../io/mxCodec';
import { mxCompactTreeLayout } from '../layout/mxCompactTreeLayout';
import { mxGraphLayout } from '../layout/mxGraphLayout';
import { mxStackLayout } from '../layout/mxStackLayout';
import { mxCell } from '../model/mxCell';
import { mxGeometry } from '../model/mxGeometry';
import { mxCellAttributeChange, mxRootChange, mxValueChange } from '../model/mxGraphModel';
import { mxClient } from '../mxClient';
import { mxClipboard } from '../util/mxClipboard';
import { mxConstants } from '../util/mxConstants';
import { mxDivResizer } from '../util/mxDivResizer';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxEventSource } from '../util/mxEventSource';
import { mxForm } from '../util/mxForm';
import { mxLog } from '../util/mxLog';
import { mxResources } from '../util/mxResources';
import { mxUndoManager } from '../util/mxUndoManager';
import { mxUtils } from '../util/mxUtils';
import { mxWindow } from '../util/mxWindow';
import { mxGraph } from '../view/mxGraph';
import { mxLayoutManager } from '../view/mxLayoutManager';
import { mxOutline } from '../view/mxOutline';
import { mxPrintPreview } from '../view/mxPrintPreview';
import { mxSwimlaneManager } from '../view/mxSwimlaneManager';
import { mxDefaultKeyHandler } from './mxDefaultKeyHandler';
import { mxDefaultPopupMenu } from './mxDefaultPopupMenu';
import { mxDefaultToolbar } from './mxDefaultToolbar';

export class mxEditor extends mxEventSource {
  constructor(config: any) {
    super();
    this.actions = [];
    this.addActions();
    this.cycleAttributeValues = [];
    this.popupHandler = new mxDefaultPopupMenu();
    this.undoManager = new mxUndoManager();
    this.graph = this.createGraph();
    this.toolbar = this.createToolbar();
    this.keyHandler = new mxDefaultKeyHandler(this);
    this.configure(config);
    this.graph.swimlaneIndicatorColorAttribute = this.cycleAttributeName;
    if (!!this.onInit) {
      this.onInit();
    }
    if (mxClient.IS_IE) {
      mxEvent.addListener(window, 'unload', () => {
        this.destroy();
      });
    }
  }

  onInit?: Function;
  actions: any[];
  cycleAttributeValues: any[] = [];
  popupHandler: mxDefaultPopupMenu;
  undoManager: mxUndoManager;
  graph: mxGraph;
  toolbar: any;
  keyHandler: mxDefaultKeyHandler;
  /**
   * Variable: askZoomResource
   *
   * Specifies the resource key for the zoom dialog. If the resource for this
   * key does not exist then the value is used as the error message. Default
   * is 'askZoom'.
   */
  askZoomResource: any;
  /**
   * Variable: lastSavedResource
   *
   * Specifies the resource key for the last saved info. If the resource for
   * this key does not exist then the value is used as the error message.
   * Default is 'lastSaved'.
   */
  lastSavedResource: any = 'lastSaved';
  /**
   * Variable: currentFileResource
   *
   * Specifies the resource key for the current file info. If the resource for
   * this key does not exist then the value is used as the error message.
   * Default is 'lastSaved'.
   */
  currentFileResource: any = 'lastSaved';
  /**
   * Variable: propertiesResource
   *
   * Specifies the resource key for the properties window title. If the
   * resource for this key does not exist then the value is used as the
   * error message. Default is 'properties'.
   */
  propertiesResource: any = 'properties';
  /**
   * Variable: tasksResource
   *
   * Specifies the resource key for the tasks window title. If the
   * resource for this key does not exist then the value is used as the
   * error message. Default is 'tasks'.
   */
  tasksResource: any = 'tasks';
  /**
   * Variable: helpResource
   *
   * Specifies the resource key for the help window title. If the
   * resource for this key does not exist then the value is used as the
   * error message. Default is 'help'.
   */
  helpResource: any = 'help';
  /**
   * Variable: outlineResource
   *
   * Specifies the resource key for the outline window title. If the
   * resource for this key does not exist then the value is used as the
   * error message. Default is 'outline'.
   */
  outlineResource: any = 'outline';
  /**
   * Variable: outline
   *
   * Reference to the <mxWindow> that contains the outline. The <mxOutline>
   * is stored in outline.outline.
   */
  outline: any = 'lastSaved';
  /**
   * Variable: graphRenderHint
   *
   * Holds the render hint used for creating the
   * graph in <setGraphContainer>. See <mxGraph>.
   * Default is null.
   */
  graphRenderHint: any = null;
  /**
   * Variable: status
   *
   * DOM container that holds the statusbar. Default is null.
   * Use <setStatusContainer> to set this value.
   */
  status: any = null;
  /**
   * Variable: dblClickAction
   *
   * Specifies the name of the action to be executed
   * when a cell is double clicked. Default is edit.
   *
   * To handle a singleclick, use the following code.
   *
   * (code)
   * editor.graph.addListener(mxEvent.CLICK, function(sender, evt)
   * {
   *   var e = evt.getProperty('event');
   *   var cell = evt.getProperty('cell');
   *
   *   if (!!cell && !e.isConsumed())
   *   {
   *     // Do something useful with cell...
   *     e.consume();
   *   }
   * });
   * (end)
   * @example edit
   */
  dblClickAction: string = 'edit';
  /**
   * Variable: swimlaneRequired
   *
   * Specifies if new cells must be inserted
   * into an existing swimlane. Otherwise, cells
   * that are not swimlanes can be inserted as
   * top-level cells. Default is false.
   */
  swimlaneRequired: boolean = false;
  /**
   * Variable: disableContextMenu
   *
   * Specifies if the context menu should be disabled in the graph container.
   * Default is true.
   * @example true
   */
  disableContextMenu: boolean = true;
  /**
   * Variable: insertFunction
   *
   * Specifies the function to be used for inserting new
   * cells into the graph. This is assigned from the
   * <mxDefaultToolbar> if a vertex-tool is clicked.
   */
  insertFunction: any = null;
  /**
   * Variable: forcedInserting
   *
   * Specifies if a new cell should be inserted on a single
   * click even using <insertFunction> if there is a cell
   * under the mousepointer, otherwise the cell under the
   * mousepointer is selected. Default is false.
   */
  forcedInserting: boolean = false;
  /**
   * Variable: templates
   *
   * Maps from names to protoype cells to be used
   * in the toolbar for inserting new cells into
   * the diagram.
   */
  templates: any = false;
  /**
   * Variable: defaultEdge
   *
   * Prototype edge cell that is used for creating
   * new edges.
   */
  defaultEdge: any;
  /**
   * Variable: defaultEdgeStyle
   *
   * Specifies the edge style to be returned in <getEdgeStyle>.
   * Default is null.
   */
  defaultEdgeStyle: any = null;
  /**
   * Variable: defaultGroup
   *
   * Prototype group cell that is used for creating
   * new groups.
   */
  defaultGroup: any = null;
  /**
   * Variable: groupBorderSize
   *
   * Default size for the border of new groups. If null,
   * then then <mxGraph.gridSize> is used. Default is
   * null.
   */
  groupBorderSize: any;
  /**
   * Variable: filename
   *
   * Contains the URL of the last opened file as a string.
   * Default is null.
   */
  filename?: string;
  /**
   * Variable: lineFeed
   *
   * Character to be used for encoding linefeeds in <save>. Default is '&#xa;'.
   * @example &#xa;
   */
  linefeed: string = '&#xa;';
  /**
   * Variable: postParameterName
   *
   * Specifies if the name of the post parameter that contains the diagram
   * data in a post request to the server. Default is xml.
   * @example xml
   */
  postParameterName: string = 'xml';
  /**
   * Variable: escapePostData
   *
   * Specifies if the data in the post request for saving a diagram
   * should be converted using encodeURIComponent. Default is true.
   * @example true
   */
  escapePostData: boolean = true;
  /**
   * Variable: urlPost
   *
   * Specifies the URL to be used for posting the diagram
   * to a backend in <save>.
   */
  urlPost: any = null;
  /**
   * Variable: urlImage
   *
   * Specifies the URL to be used for creating a bitmap of
   * the graph in the image action.
   */
  urlImage: any;
  /**
   * Variable: horizontalFlow
   *
   * Specifies the direction of the flow
   * in the diagram. This is used in the
   * layout algorithms. Default is false,
   * ie. vertical flow.
   */
  horizontalFlow: boolean = false;
  /**
   * Variable: layoutDiagram
   *
   * Specifies if the top-level elements in the
   * diagram should be layed out using a vertical
   * or horizontal stack depending on the setting
   * of <horizontalFlow>. The spacing between the
   * swimlanes is specified by <swimlaneSpacing>.
   * Default is false.
   *
   * If the top-level elements are swimlanes, then
   * the intra-swimlane layout is activated by
   * the <layoutSwimlanes> switch.
   */
  layoutDiagram: boolean = false;
  /**
   * Variable: swimlaneSpacing
   *
   * Specifies the spacing between swimlanes if
   * automatic layout is turned on in
   * <layoutDiagram>. Default is 0.
   */
  swimlaneSpacing: number = 0;
  /**
   * Variable: maintainSwimlanes
   *
   * Specifies if the swimlanes should be kept at the same
   * width or height depending on the setting of
   * <horizontalFlow>.  Default is false.
   *
   * For horizontal flows, all swimlanes
   * have the same height and for vertical flows, all swimlanes
   * have the same width. Furthermore, the swimlanes are
   * automatically "stacked" if <layoutDiagram> is true.
   */
  maintainSwimlanes: boolean = false;
  /**
   * Variable: layoutSwimlanes
   *
   * Specifies if the children of swimlanes should
   * be layed out, either vertically or horizontally
   * depending on <horizontalFlow>.
   * Default is false.
   */
  layoutSwimlanes: boolean = false;
  /**
   * Variable: cycleAttributeIndex
   *
   * Index of the last consumed attribute index. If a new
   * swimlane is inserted, then the <cycleAttributeValues>
   * at this index will be used as the value for
   * <cycleAttributeName>. Default is 0.
   */
  cycleAttributeIndex: number = 0;
  /**
   * Variable: cycleAttributeName
   *
   * Name of the attribute to be assigned a <cycleAttributeValues>
   * when inserting new swimlanes. Default is fillColor.
   * @example fillColor
   */
  cycleAttributeName: string = 'fillColor';
  /**
   * Variable: tasks
   *
   * Holds the <mxWindow> created in <showTasks>.
   */
  tasks: any = false;
  /**
   * Variable: tasksWindowImage
   *
   * Icon for the tasks window.
   */
  tasksWindowImage: any;
  /**
   * Variable: tasksTop
   *
   * Specifies the top coordinate of the tasks window in pixels.
   * Default is 20.
   * @example 20
   */
  tasksTop: number = 20;
  /**
   * Variable: help
   *
   * Holds the <mxWindow> created in <showHelp>.
   */
  help: any = 20;
  /**
   * Variable: helpWindowImage
   *
   * Icon for the help window.
   */
  helpWindowImage: any;
  /**
   * Variable: urlHelp
   *
   * Specifies the URL to be used for the contents of the
   * Online Help window. This is usually specified in the
   * resources file under urlHelp for language-specific
   * online help support.
   */
  urlHelp: any;
  /**
   * Variable: helpWidth
   *
   * Specifies the width of the help window in pixels.
   * Default is 300.
   * @example 300
   */
  helpWidth: number = 300;
  /**
   * Variable: helpHeight
   *
   * Specifies the height of the help window in pixels.
   * Default is 260.
   * @example 260
   */
  helpHeight: number = 260;
  /**
   * Variable: propertiesWidth
   *
   * Specifies the width of the properties window in pixels.
   * Default is 240.
   * @example 240
   */
  propertiesWidth: number = 240;
  /**
   * Variable: propertiesHeight
   *
   * Specifies the height of the properties window in pixels.
   * If no height is specified then the window will be automatically
   * sized to fit its contents. Default is null.
   */
  propertiesHeight: any = null;
  /**
   * Variable: movePropertiesDialog
   *
   * Specifies if the properties dialog should be automatically
   * moved near the cell it is displayed for, otherwise the
   * dialog is not moved. This value is only taken into
   * account if the dialog is already visible. Default is false.
   */
  movePropertiesDialog: boolean = false;
  /**
   * Variable: validating
   *
   * Specifies if <mxGraph.validateGraph> should automatically be invoked after
   * each change. Default is false.
   */
  validating: boolean = false;
  /**
   * Variable: modified
   *
   * True if the graph has been modified since it was last saved.
   */
  modified: boolean = true;
  lastSnapshot: any;
  ignoredChanges: number = 0;
  rubberband?: mxRubberband;
  properties: any;
  /**
   * @example true
   */
  destroyed: boolean = true;
  private diagramLayout?: mxStackLayout;
  private swimlaneLayout?: mxCompactTreeLayout;

  /**
   * Function: isModified
   *
   * Returns <modified>.
   */
  isModified(): boolean {
    return this.modified;
  }

  /**
   * Function: setModified
   *
   * Sets <modified> to the specified boolean value.
   */
  setModified(value: any): void {
    this.modified = value;
  }

  /**
   * Function: addActions
   *
   * Adds the built-in actions to the editor instance.
   *
   * save - Saves the graph using <urlPost>.
   * print - Shows the graph in a new print preview window.
   * show - Shows the graph in a new window.
   * exportImage - Shows the graph as a bitmap image using <getUrlImage>.
   * refresh - Refreshes the graph's display.
   * cut - Copies the current selection into the clipboard
   * and removes it from the graph.
   * copy - Copies the current selection into the clipboard.
   * paste - Pastes the clipboard into the graph.
   * delete - Removes the current selection from the graph.
   * group - Puts the current selection into a new group.
   * ungroup - Removes the selected groups and selects the children.
   * undo - Undoes the last change on the graph model.
   * redo - Redoes the last change on the graph model.
   * zoom - Sets the zoom via a dialog.
   * zoomIn - Zooms into the graph.
   * zoomOut - Zooms out of the graph
   * actualSize - Resets the scale and translation on the graph.
   * fit - Changes the scale so that the graph fits into the window.
   * showProperties - Shows the properties dialog.
   * selectAll - Selects all cells.
   * selectNone - Clears the selection.
   * selectVertices - Selects all vertices.
   * selectEdges = Selects all edges.
   * edit - Starts editing the current selection cell.
   * enterGroup - Drills down into the current selection cell.
   * exitGroup - Moves up in the drilling hierachy
   * home - Moves to the topmost parent in the drilling hierarchy
   * selectPrevious - Selects the previous cell.
   * selectNext - Selects the next cell.
   * selectParent - Selects the parent of the selection cell.
   * selectChild - Selects the first child of the selection cell.
   * collapse - Collapses the currently selected cells.
   * expand - Expands the currently selected cells.
   * bold - Toggle bold text style.
   * italic - Toggle italic text style.
   * underline - Toggle underline text style.
   * alignCellsLeft - Aligns the selection cells at the left.
   * alignCellsCenter - Aligns the selection cells in the center.
   * alignCellsRight - Aligns the selection cells at the right.
   * alignCellsTop - Aligns the selection cells at the top.
   * alignCellsMiddle - Aligns the selection cells in the middle.
   * alignCellsBottom - Aligns the selection cells at the bottom.
   * alignFontLeft - Sets the horizontal text alignment to left.
   * alignFontCenter - Sets the horizontal text alignment to center.
   * alignFontRight - Sets the horizontal text alignment to right.
   * alignFontTop - Sets the vertical text alignment to top.
   * alignFontMiddle - Sets the vertical text alignment to middle.
   * alignFontBottom - Sets the vertical text alignment to bottom.
   * toggleTasks - Shows or hides the tasks window.
   * toggleHelp - Shows or hides the help window.
   * toggleOutline - Shows or hides the outline window.
   * toggleConsole - Shows or hides the console window.
   */
  addActions(): void {
    this.addAction('save', function (editor) {
      editor.save();
    });
    this.addAction('print', function (editor) {
      const preview = new mxPrintPreview(editor.graph, 1);
      preview.open();
    });
    this.addAction('show', function (editor) {
      mxUtils.show(editor.graph, null, 10, 10);
    });
    this.addAction('exportImage', function (editor) {
      const url = editor.getUrlImage();
      if (!url || mxClient.IS_LOCAL) {
        editor.execute('show');
      } else {
        const node = mxUtils.getViewXml(editor.graph, 1);
        const xml = mxUtils.getXml(node, '\n');
        mxUtils.submit(url, editor.postParameterName + '=' + encodeURIComponent(xml), document, '_blank');
      }
    });
    this.addAction('refresh', function (editor) {
      editor.graph.refresh();
    });
    this.addAction('cut', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.cut(editor.graph);
      }
    });
    this.addAction('copy', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.copy(editor.graph);
      }
    });
    this.addAction('paste', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.paste(editor.graph);
      }
    });
    this.addAction('delete', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.removeCells();
      }
    });
    this.addAction('group', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setSelectionCell(editor.groupCells());
      }
    });
    this.addAction('ungroup', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setSelectionCells(editor.graph.ungroupCells());
      }
    });
    this.addAction('removeFromParent', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.removeCellsFromParent();
      }
    });
    this.addAction('undo', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.undo();
      }
    });
    this.addAction('redo', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.redo();
      }
    });
    this.addAction('zoomIn', function (editor) {
      editor.graph.zoomIn();
    });
    this.addAction('zoomOut', function (editor) {
      editor.graph.zoomOut();
    });
    this.addAction('actualSize', function (editor) {
      editor.graph.zoomActual();
    });
    this.addAction('fit', function (editor) {
      editor.graph.fit();
    });
    this.addAction('showProperties', function (editor, cell) {
      editor.showProperties(cell);
    });
    this.addAction('selectAll', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectAll();
      }
    });
    this.addAction('selectNone', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.clearSelection();
      }
    });
    this.addAction('selectVertices', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectVertices();
      }
    });
    this.addAction('selectEdges', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectEdges();
      }
    });
    this.addAction('edit', function (editor, cell) {
      if (editor.graph.isEnabled() && editor.graph.isCellEditable(cell)) {
        editor.graph.startEditingAtCell(cell);
      }
    });
    this.addAction('toBack', function (editor, cell) {
      if (editor.graph.isEnabled()) {
        editor.graph.orderCells(true);
      }
    });
    this.addAction('toFront', function (editor, cell) {
      if (editor.graph.isEnabled()) {
        editor.graph.orderCells(false);
      }
    });
    this.addAction('enterGroup', function (editor, cell) {
      editor.graph.enterGroup(cell);
    });
    this.addAction('exitGroup', function (editor) {
      editor.graph.exitGroup();
    });
    this.addAction('home', function (editor) {
      editor.graph.home();
    });
    this.addAction('selectPrevious', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectPreviousCell();
      }
    });
    this.addAction('selectNext', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectNextCell();
      }
    });
    this.addAction('selectParent', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectParentCell();
      }
    });
    this.addAction('selectChild', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectChildCell();
      }
    });
    this.addAction('collapse', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.foldCells(true);
      }
    });
    this.addAction('collapseAll', function (editor) {
      if (editor.graph.isEnabled()) {
        const cells = editor.graph.getChildVertices();
        editor.graph.foldCells(true, false, cells);
      }
    });
    this.addAction('expand', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.foldCells(false);
      }
    });
    this.addAction('expandAll', function (editor) {
      if (editor.graph.isEnabled()) {
        const cells = editor.graph.getChildVertices();
        editor.graph.foldCells(false, false, cells);
      }
    });
    this.addAction('bold', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_BOLD);
      }
    });
    this.addAction('italic', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_ITALIC);
      }
    });
    this.addAction('underline', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_UNDERLINE);
      }
    });
    this.addAction('alignCellsLeft', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_LEFT);
      }
    });
    this.addAction('alignCellsCenter', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_CENTER);
      }
    });
    this.addAction('alignCellsRight', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_RIGHT);
      }
    });
    this.addAction('alignCellsTop', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_TOP);
      }
    });
    this.addAction('alignCellsMiddle', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_MIDDLE);
      }
    });
    this.addAction('alignCellsBottom', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_BOTTOM);
      }
    });
    this.addAction('alignFontLeft', function (editor) {
      editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
    });
    this.addAction('alignFontCenter', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
      }
    });
    this.addAction('alignFontRight', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_RIGHT);
      }
    });
    this.addAction('alignFontTop', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
      }
    });
    this.addAction('alignFontMiddle', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
      }
    });
    this.addAction('alignFontBottom', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_BOTTOM);
      }
    });
    this.addAction('zoom', function (editor) {
      const current = editor.graph.getView().scale * 100;
      const scale = parseFloat(mxUtils.prompt(mxResources.get(editor.askZoomResource) || editor.askZoomResource, current)) / 100;
      if (!isNaN(scale)) {
        editor.graph.getView().setScale(scale);
      }
    });
    this.addAction('toggleTasks', function (editor) {
      if (!!editor.tasks) {
        editor.tasks.setVisible(!editor.tasks.isVisible());
      } else {
        editor.showTasks();
      }
    });
    this.addAction('toggleHelp', function (editor) {
      if (!!editor.help) {
        editor.help.setVisible(!editor.help.isVisible());
      } else {
        editor.showHelp();
      }
    });
    this.addAction('toggleOutline', function (editor) {
      if (!editor.outline) {
        editor.showOutline();
      } else {
        editor.outline.setVisible(!editor.outline.isVisible());
      }
    });
    this.addAction('toggleConsole', function (editor) {
      mxLog.setVisible(!mxLog.isVisible());
    });
  }

  /**
   * Function: configure
   *
   * Configures the editor using the specified node. To load the
   * configuration from a given URL the following code can be used to obtain
   * the XML node.
   *
   * (code)
   * var node = mxUtils.load(url).getDocumentElement();
   * (end)
   *
   * Parameters:
   *
   * node - XML node that contains the configuration.
   */
  configure(node: Node): void {
    if (!!node) {
      const dec = new mxCodec(node.ownerDocument);
      dec.decode(node, this);
      this.resetHistory();
    }
  }

  /**
   * Function: resetFirstTime
   *
   * Resets the cookie that is used to remember if the editor has already
   * been used.
   */
  resetFirstTime(): void {
    document.cookie = 'mxgraph=seen; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/';
  }

  /**
   * Function: resetHistory
   *
   * Resets the command history, modified state and counters.
   */
  resetHistory(): void {
    this.lastSnapshot = new Date().getTime();
    this.undoManager.clear();
    this.ignoredChanges = 0;
    this.setModified(false);
  }

  /**
   * Function: addAction
   *
   * Binds the specified actionname to the specified function.
   *
   * Parameters:
   *
   * actionname - String that specifies the name of the action
   * to be added.
   * funct - Function that implements the new action. The first
   * argument of the function is the editor it is used
   * with, the second argument is the cell it operates
   * upon.
   *
   * Example:
   * (code)
   * editor.addAction('test', function(editor, cell)
   * {
   * 		mxUtils.alert("test "+cell);
   * });
   * (end)
   */
  addAction(actionname: any, funct: Function): void {
    this.actions[actionname] = funct;
  }

  /**
   * Function: execute
   *
   * Executes the function with the given name in <actions> passing the
   * editor instance and given cell as the first and second argument. All
   * additional arguments are passed to the action as well. This method
   * contains a try-catch block and displays an error message if an action
   * causes an exception. The exception is re-thrown after the error
   * message was displayed.
   *
   * Example:
   *
   * (code)
   * editor.execute("showProperties", cell);
   * (end)
   */
  execute(actionname: any, cell?: mxCell, evt?: Event): void {
    const action = this.actions[actionname];
    if (!!action) {
      try {
        const args = arguments;
        args[0] = this;
        action.apply(this, args);
      } catch (e) {
        mxUtils.error('Cannot execute ' + actionname + ': ' + e.message, 280, true);
        throw e;
      }
    } else {
      mxUtils.error('Cannot find action ' + actionname, 280, true);
    }
  }

  /**
   * Function: addTemplate
   *
   * Adds the specified template under the given name in <templates>.
   */
  addTemplate(name: string, template: any): void {
    this.templates[name] = template;
  }

  /**
   * Function: getTemplate
   *
   * Returns the template for the given name.
   */
  getTemplate(name: string): any {
    return this.templates[name];
  }

  /**
   * Function: createGraph
   *
   * Creates the <graph> for the editor. The graph is created with no
   * container and is initialized from <setGraphContainer>.
   */
  createGraph(): any {
    const graph = new mxGraph(null, null, this.graphRenderHint);
    graph.setTooltips(true);
    graph.setPanning(true);
    this.installDblClickHandler(graph);
    this.installUndoHandler(graph);
    this.installDrillHandler(graph);
    this.installChangeHandler(graph);
    this.installInsertHandler(graph);
    graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
      return this.createPopupMenu(menu, cell, evt);
    };
    graph.connectionHandler.factoryMethod = (source, target) => {
      return this.createEdge(source, target);
    };
    this.createSwimlaneManager(graph);
    this.createLayoutManager(graph);
    return graph;
  }

  /**
   * Function: createSwimlaneManager
   *
   * Sets the graph's container using <mxGraph.init>.
   */
  createSwimlaneManager(graph: mxGraph): any {
    const swimlaneMgr = new mxSwimlaneManager(graph, false);
    swimlaneMgr.isHorizontal = () => {
      return this.horizontalFlow;
    };
    swimlaneMgr.isEnabled = () => {
      return this.maintainSwimlanes;
    };
    return swimlaneMgr;
  }

  /**
   * Function: createLayoutManager
   *
   * Creates a layout manager for the swimlane and diagram layouts, that
   * is, the locally defined inter- and intraswimlane layouts.
   */
  createLayoutManager(graph: mxGraph): mxLayoutManager {
    const layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = (cell) => {
      let layout: mxGraphLayout | undefined;
      const model = this.graph.getModel();
      if (model.getParent(cell)) {
        if (this.layoutSwimlanes && graph.isSwimlane(cell)) {
          if (!this.swimlaneLayout) {
            this.swimlaneLayout = this.createSwimlaneLayout();
          }
          layout = this.swimlaneLayout;
        } else if (this.layoutDiagram && (graph.isValidRoot(cell) || !model.getParent(model.getParent(cell)))) {
          if (!this.diagramLayout) {
            this.diagramLayout = this.createDiagramLayout();
          }
          layout = this.diagramLayout;
        }
      }
      return layout;
    };
    return layoutMgr;
  }

  /**
   * Function: setGraphContainer
   *
   * Sets the graph's container using <mxGraph.init>.
   */
  setGraphContainer(container: HTMLElement): void {
    if (!this.graph.container) {
      this.graph.init(container);
      this.rubberband = new mxRubberband(this.graph);
      if (this.disableContextMenu) {
        mxEvent.disableContextMenu(container);
      }
      if (mxClient.IS_QUIRKS) {
        new mxDivResizer(container);
      }
    }
  }

  /**
   * Function: installDblClickHandler
   *
   * Overrides <mxGraph.dblClick> to invoke <dblClickAction>
   * on a cell and reset the selection tool in the toolbar.
   */
  installDblClickHandler(graph: mxGraph): void {
    graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');
      if (!!cell && graph.isEnabled() && !!this.dblClickAction) {
        this.execute(this.dblClickAction, cell);
        evt.consume();
      }
    });
  }

  /**
   * Function: installUndoHandler
   *
   * Adds the <undoManager> to the graph model and the view.
   */
  installUndoHandler(graph: mxGraph): void {
    const listener = (sender, evt) => {
      const edit = evt.getProperty('edit');
      this.undoManager.undoableEditHappened(edit);
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);
    const undoHandler = function (sender, evt) {
      const changes = evt.getProperty('edit').changes;
      graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
    };
    this.undoManager.addListener(mxEvent.UNDO, undoHandler);
    this.undoManager.addListener(mxEvent.REDO, undoHandler);
  }

  /**
   * Function: installDrillHandler
   *
   * Installs listeners for dispatching the <root> event.
   */
  installDrillHandler(graph: mxGraph): void {
    const listener = (sender) => {
      this.fireEvent(new mxEventObject(mxEvent.ROOT));
    };
    graph.getView().addListener(mxEvent.DOWN, listener);
    graph.getView().addListener(mxEvent.UP, listener);
  }

  /**
   * Function: installChangeHandler
   *
   * Installs the listeners required to automatically validate
   * the graph. On each change of the root, this implementation
   * fires a <root> event.
   */
  installChangeHandler(graph: mxGraph): void {
    const listener = (sender, evt) => {
      this.setModified(true);
      if (this.validating) {
        graph.validateGraph();
      }
      const changes = evt.getProperty('edit').changes;
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        if (change instanceof mxRootChange || (change instanceof mxValueChange && change.cell == this.graph.model.root) || (change instanceof mxCellAttributeChange && change.cell == this.graph.model.root)) {
          this.fireEvent(new mxEventObject(mxEvent.ROOT));
          break;
        }
      }
    };
    graph.getModel().addListener(mxEvent.CHANGE, listener);
  }

  /**
   * Function: installInsertHandler
   *
   * Installs the handler for invoking <insertFunction> if
   * one is defined.
   */
  installInsertHandler(graph: mxGraph): void {
    class InsertHandler extends mxGraphHandler {
      constructor(private editor: mxEditor) {
        super(editor.graph);
      }

      private isActive: boolean = false;

      mouseDown(sender, me) {
        if (!!this.editor.insertFunction && !me.isPopupTrigger() && (this.editor.forcedInserting || !me.getState())) {
          this.editor.graph.clearSelection();
          this.editor.insertFunction(me.getEvent(), me.getCell());
          this.isActive = true;
          me.consume();
        }
      }

      mouseMove(sender, me) {
        if (this.isActive) {
          me.consume();
        }
      }

      mouseUp(sender, me) {
        if (this.isActive) {
          this.isActive = false;
          me.consume();
        }
      }
    }

    const insertHandler = new InsertHandler(this);
    graph.addMouseListener(insertHandler);
  }

  /**
   * Function: createDiagramLayout
   *
   * Creates the layout instance used to layout the
   * swimlanes in the diagram.
   */
  createDiagramLayout(): mxStackLayout {
    const gs = this.graph.gridSize;
    const layout = new mxStackLayout(this.graph, !this.horizontalFlow, this.swimlaneSpacing, 2 * gs, 2 * gs);
    layout.isVertexIgnored = function (cell) {
      return !layout.graph.isSwimlane(cell);
    };
    return layout;
  }

  /**
   * Function: createSwimlaneLayout
   *
   * Creates the layout instance used to layout the
   * children of each swimlane.
   */
  createSwimlaneLayout(): mxCompactTreeLayout {
    return new mxCompactTreeLayout(this.graph, this.horizontalFlow);
  }

  /**
   * Function: createToolbar
   *
   * Creates the <toolbar> with no container.
   */
  createToolbar(): any {
    return new mxDefaultToolbar(null, this);
  }

  /**
   * Function: setToolbarContainer
   *
   * Initializes the toolbar for the given container.
   */
  setToolbarContainer(container: HTMLElement): void {
    this.toolbar.init(container);
    if (mxClient.IS_QUIRKS) {
      new mxDivResizer(container);
    }
  }

  /**
   * Function: setStatusContainer
   *
   * Creates the <status> using the specified container.
   *
   * This implementation adds listeners in the editor to
   * display the last saved time and the current filename
   * in the status bar.
   *
   * Parameters:
   *
   * container - DOM node that will contain the statusbar.
   */
  setStatusContainer(container: HTMLElement): void {
    if (!this.status) {
      this.status = container;
      this.addListener(mxEvent.SAVE, () => {
        const tstamp = new Date().toLocaleString();
        this.setStatus((mxResources.get(this.lastSavedResource) || this.lastSavedResource) + ': ' + tstamp);
      });
      this.addListener(mxEvent.OPEN, () => {
        this.setStatus((mxResources.get(this.currentFileResource) || this.currentFileResource) + ': ' + this.filename);
      });
      if (mxClient.IS_QUIRKS) {
        new mxDivResizer(container);
      }
    }
  }

  /**
   * Function: setStatus
   *
   * Display the specified message in the status bar.
   *
   * Parameters:
   *
   * message - String the specified the message to
   * be displayed.
   */
  setStatus(message: any): void {
    if (!!this.status && !!message) {
      this.status.innerHTML = message;
    }
  }

  /**
   * Function: setTitleContainer
   *
   * Creates a listener to update the inner HTML of the
   * specified DOM node with the value of <getTitle>.
   *
   * Parameters:
   *
   * container - DOM node that will contain the title.
   */
  setTitleContainer(container: HTMLElement): void {
    this.addListener(mxEvent.ROOT, (sender) => {
      container.innerHTML = this.getTitle();
    });
    if (mxClient.IS_QUIRKS) {
      new mxDivResizer(container);
    }
  }

  /**
   * Function: treeLayout
   *
   * Executes a vertical or horizontal compact tree layout
   * using the specified cell as an argument. The cell may
   * either be a group or the root of a tree.
   *
   * Parameters:
   *
   * cell - <mxCell> to use in the compact tree layout.
   * horizontal - Optional boolean to specify the tree's
   * orientation. Default is true.
   */
  treeLayout(cell: mxCell, horizontal: any): void {
    if (!!cell) {
      const layout = new mxCompactTreeLayout(this.graph, horizontal);
      layout.execute(cell);
    }
  }

  /**
   * Function: getTitle
   *
   * Returns the string value for the current root of the
   * diagram.
   */
  getTitle(): any {
    let title = '';
    const graph = this.graph;
    let cell = graph.getCurrentRoot();
    while (!!cell && graph.getModel().getParent(graph.getModel().getParent(cell))) {
      if (graph.isValidRoot(cell)) {
        title = ' > ' + graph.convertValueToString(cell) + title;
      }
      cell = graph.getModel().getParent(cell);
    }
    const prefix = this.getRootTitle();
    return prefix + title;
  }

  /**
   * Function: getRootTitle
   *
   * Returns the string value of the root cell in
   * <mxGraph.model>.
   */
  getRootTitle(): any {
    const root = this.graph.getModel().getRoot();
    return this.graph.convertValueToString(root);
  }

  /**
   * Function: undo
   *
   * Undo the last change in <graph>.
   */
  undo(): void {
    this.undoManager.undo();
  }

  /**
   * Function: redo
   *
   * Redo the last change in <graph>.
   */
  redo(): void {
    this.undoManager.redo();
  }

  /**
   * Function: groupCells
   *
   * Invokes <createGroup> to create a new group cell and the invokes
   * <mxGraph.groupCells>, using the grid size of the graph as the spacing
   * in the group's content area.
   */
  groupCells(): any {
    const border = (!!this.groupBorderSize) ? this.groupBorderSize : this.graph.gridSize;
    return this.graph.groupCells(this.createGroup(), border);
  }

  /**
   * Function: createGroup
   *
   * Creates and returns a clone of <defaultGroup> to be used
   * as a new group cell in <group>.
   */
  createGroup(): any {
    const model = this.graph.getModel();
    return model.cloneCell(this.defaultGroup);
  }

  /**
   * Function: open
   *
   * Opens the specified file synchronously and parses it using
   * <readGraphModel>. It updates <filename> and fires an <open>-event after
   * the file has been opened. Exceptions should be handled as follows:
   *
   * (code)
   * try
   * {
   *   editor.open(filename);
   * }
   * catch (e)
   * {
   *   mxUtils.error('Cannot open ' + filename +
   *     ': ' + e.message, 280, true);
   * }
   * (end)
   *
   * Parameters:
   *
   * filename - URL of the file to be opened.
   */
  open(filename: string): void {
    if (!!filename) {
      const xml = mxUtils.load(filename).getXml();
      this.readGraphModel(xml.documentElement);
      this.filename = filename;
      this.fireEvent(new mxEventObject(mxEvent.OPEN, 'filename', filename));
    }
  }

  /**
   * Function: readGraphModel
   *
   * Reads the specified XML node into the existing graph model and resets
   * the command history and modified state.
   */
  readGraphModel(node: Node): void {
    const dec = new mxCodec(node.ownerDocument);
    dec.decode(node, this.graph.getModel());
    this.resetHistory();
  }

  /**
   * Function: save
   *
   * Posts the string returned by <writeGraphModel> to the given URL or the
   * URL returned by <getUrlPost>. The actual posting is carried out by
   * <postDiagram>. If the URL is null then the resulting XML will be
   * displayed using <mxUtils.popup>. Exceptions should be handled as
   * follows:
   *
   * (code)
   * try
   * {
   *   editor.save();
   * }
   * catch (e)
   * {
   *   mxUtils.error('Cannot save : ' + e.message, 280, true);
   * }
   * (end)
   */
  save(url: string, linefeed: any): void {
    url = url || this.getUrlPost();
    if (!!url && url.length > 0) {
      const data = this.writeGraphModel(linefeed);
      this.postDiagram(url, data);
      this.setModified(false);
    }
    this.fireEvent(new mxEventObject(mxEvent.SAVE, 'url', url));
  }

  /**
   * Function: postDiagram
   *
   * Hook for subclassers to override the posting of a diagram
   * represented by the given node to the given URL. This fires
   * an asynchronous <post> event if the diagram has been posted.
   *
   * Example:
   *
   * To replace the diagram with the diagram in the response, use the
   * following code.
   *
   * (code)
   * editor.addListener(mxEvent.POST, function(sender, evt)
   * {
   *   // Process response (replace diagram)
   *   var req = evt.getProperty('request');
   *   var root = req.getDocumentElement();
   *   editor.graph.readGraphModel(root)
   * });
   * (end)
   */
  postDiagram(url: string, data: any): void {
    if (this.escapePostData) {
      data = encodeURIComponent(data);
    }
    mxUtils.post(url, this.postParameterName + '=' + data, (req) => {
      this.fireEvent(new mxEventObject(mxEvent.POST, 'request', req, 'url', url, 'data', data));
    });
  }

  /**
   * Function: writeGraphModel
   *
   * Hook to create the string representation of the diagram. The default
   * implementation uses an <mxCodec> to encode the graph model as
   * follows:
   *
   * (code)
   * var enc = new mxCodec();
   * var node = enc.encode(this.graph.getModel());
   * return mxUtils.getXml(node, this.linefeed);
   * (end)
   *
   * Parameters:
   *
   * linefeed - Optional character to be used as the linefeed. Default is
   * <linefeed>.
   */
  writeGraphModel(linefeed: any): any {
    linefeed = (!!linefeed) ? linefeed : this.linefeed;
    const enc = new mxCodec();
    const node = enc.encode(this.graph.getModel());
    return mxUtils.getXml(node, linefeed);
  }

  /**
   * Function: getUrlPost
   *
   * Returns the URL to post the diagram to. This is used
   * in <save>. The default implementation returns <urlPost>,
   * adding <code>?draft=true</code>.
   */
  getUrlPost(): any {
    return this.urlPost;
  }

  /**
   * Function: getUrlImage
   *
   * Returns the URL to create the image with. This is typically
   * the URL of a backend which accepts an XML representation
   * of a graph view to create an image. The function is used
   * in the image action to create an image. This implementation
   * returns <urlImage>.
   */
  getUrlImage(): any {
    return this.urlImage;
  }

  /**
   * Function: swapStyles
   *
   * Swaps the styles for the given names in the graph's
   * stylesheet and refreshes the graph.
   */
  swapStyles(first: any, second: any): void {
    const style = this.graph.getStylesheet().styles[second];
    this.graph.getView().getStylesheet().putCellStyle(second, this.graph.getStylesheet().styles[first]);
    this.graph.getStylesheet().putCellStyle(first, style);
    this.graph.refresh();
  }

  /**
   * Function: showProperties
   *
   * Creates and shows the properties dialog for the given
   * cell. The content area of the dialog is created using
   * <createProperties>.
   */
  showProperties(cell: mxCell): void {
    cell = cell || this.graph.getSelectionCell();
    if (!cell) {
      cell = this.graph.getCurrentRoot();
      if (!cell) {
        cell = this.graph.getModel().getRoot();
      }
    }
    if (!!cell) {
      this.graph.stopEditing(true);
      const offset = mxUtils.getOffset(this.graph.container);
      let x = offset.x + 10;
      let y = offset.y;
      if (!!this.properties && !this.movePropertiesDialog) {
        x = this.properties.getX();
        y = this.properties.getY();
      } else {
        const bounds = this.graph.getCellBounds(cell);
        if (!!bounds) {
          x += bounds.x + Math.min(200, bounds.width);
          y += bounds.y;
        }
      }
      this.hideProperties();
      const node = this.createProperties(cell);
      if (!!node) {
        this.properties = new mxWindow(mxResources.get(this.propertiesResource) || this.propertiesResource, node, x, y, this.propertiesWidth, this.propertiesHeight, false);
        this.properties.setVisible(true);
      }
    }
  }

  /**
   * Function: isPropertiesVisible
   *
   * Returns true if the properties dialog is currently visible.
   */
  isPropertiesVisible(): boolean {
    return !!this.properties;
  }

  /**
   * Function: createProperties
   *
   * Creates and returns the DOM node that represents the contents
   * of the properties dialog for the given cell. This implementation
   * works for user objects that are XML nodes and display all the
   * node attributes in a form.
   */
  createProperties(cell: mxCell): any {
    const model = this.graph.getModel();
    const value = model.getValue(cell);
    if (mxUtils.isNode(value)) {
      const form = new mxForm('properties');
      const id = form.addText('ID', cell.getId());
      id.setAttribute('readonly', 'true');
      let geo = undefined;
      let yField = undefined;
      let xField = undefined;
      let widthField = undefined;
      let heightField = undefined;
      if (model.isVertex(cell)) {
        geo = model.getGeometry(cell);
        if (!!geo) {
          yField = form.addText('top', geo.y);
          xField = form.addText('left', geo.x);
          widthField = form.addText('width', geo.width);
          heightField = form.addText('height', geo.height);
        }
      }
      const tmp = model.getStyle(cell);
      const style = form.addText('Style', tmp || '');
      const attrs = value.attributes;
      const texts = [];
      for (let i = 0; i < attrs.length; i++) {
        const val = attrs[i].value;
        texts[i] = form.addTextarea(attrs[i].nodeName, val, (attrs[i].nodeName == 'label') ? 4 : 2);
      }
      const okFunction = () => {
        this.hideProperties();
        model.beginUpdate();
        try {
          if (!!geo) {
            geo = geo.clone();
            geo.x = parseFloat(xField.value);
            geo.y = parseFloat(yField.value);
            geo.width = parseFloat(widthField.value);
            geo.height = parseFloat(heightField.value);
            model.setGeometry(cell, geo);
          }
          if (style.value.length > 0) {
            model.setStyle(cell, style.value);
          } else {
            model.setStyle(cell, null);
          }
          for (let i = 0; i < attrs.length; i++) {
            const edit = new mxCellAttributeChange(cell, attrs[i].nodeName, texts[i].value);
            model.execute(edit);
          }
          if (this.graph.isAutoSizeCell(cell)) {
            this.graph.updateCellSize(cell);
          }
        } finally {
          model.endUpdate();
        }
      };
      const cancelFunction = () => {
        this.hideProperties();
      };
      form.addButtons(okFunction, cancelFunction);
      return form.table;
    }
    return null;
  }

  /**
   * Function: hideProperties
   *
   * Hides the properties dialog.
   */
  hideProperties(): void {
    if (!!this.properties) {
      this.properties.destroy();
      this.properties = undefined;
    }
  }

  /**
   * Function: showTasks
   *
   * Shows the tasks window. The tasks window is created using <createTasks>. The
   * default width of the window is 200 pixels, the y-coordinate of the location
   * can be specifies in <tasksTop> and the x-coordinate is right aligned with a
   * 20 pixel offset from the right border. To change the location of the tasks
   * window, the following code can be used:
   *
   * (code)
   * var oldShowTasks = mxEditor.prototype.showTasks;
   * mxEditor.prototype.showTasks = function()
   * {
   *   oldShowTasks.apply(this, arguments); // "supercall"
   *
   *   if (!!this.tasks)
   *   {
   *     this.tasks.setLocation(10, 10);
   *   }
   * };
   * (end)
   */
  showTasks(): void {
    if (!this.tasks) {
      const div = document.createElement('div');
      div.style.padding = '4px';
      div.style.paddingLeft = '20px';
      const w = document.body.clientWidth;
      const wnd = new mxWindow(mxResources.get(this.tasksResource) || this.tasksResource, div, w - 220, this.tasksTop, 200);
      wnd.setClosable(true);
      wnd.destroyOnClose = false;
      const funct = (sender) => {
        mxEvent.release(div);
        div.innerHTML = '';
        this.createTasks(div);
      };
      this.graph.getModel().addListener(mxEvent.CHANGE, funct);
      this.graph.getSelectionModel().addListener(mxEvent.CHANGE, funct);
      this.graph.addListener(mxEvent.ROOT, funct);
      if (!!this.tasksWindowImage) {
        wnd.setImage(this.tasksWindowImage);
      }
      this.tasks = wnd;
      this.createTasks(div);
    }
    this.tasks.setVisible(true);
  }

  /**
   * Function: refreshTasks
   *
   * Updates the contents of the tasks window using <createTasks>.
   */
  refreshTasks(div: HTMLElement): void {
    if (!!this.tasks) {
      const div = this.tasks.content;
      mxEvent.release(div);
      div.innerHTML = '';
      this.createTasks(div);
    }
  }

  /**
   * Function: createTasks
   *
   * Updates the contents of the given DOM node to
   * display the tasks associated with the current
   * editor state. This is invoked whenever there
   * is a possible change of state in the editor.
   * Default implementation is empty.
   */
  createTasks(div: HTMLElement): void {
  }

  /**
   * Function: showHelp
   *
   * Shows the help window. If the help window does not exist
   * then it is created using an iframe pointing to the resource
   * for the <code>urlHelp</code> key or <urlHelp> if the resource
   * is undefined.
   */
  showHelp(tasks: any): void {
    if (!this.help) {
      const frame = document.createElement('iframe');
      frame.setAttribute('src', mxResources.get('urlHelp') || this.urlHelp);
      frame.setAttribute('height', '100%');
      frame.setAttribute('width', '100%');
      frame.setAttribute('frameBorder', '0');
      frame.style.backgroundColor = 'white';
      const w = document.body.clientWidth;
      const h = (document.body.clientHeight || document.documentElement.clientHeight);
      const wnd = new mxWindow(mxResources.get(this.helpResource) || this.helpResource, frame, (w - this.helpWidth) / 2, (h - this.helpHeight) / 3, this.helpWidth, this.helpHeight);
      wnd.setMaximizable(true);
      wnd.setClosable(true);
      wnd.destroyOnClose = false;
      wnd.setResizable(true);
      if (!!this.helpWindowImage) {
        wnd.setImage(this.helpWindowImage);
      }
      if (mxClient.IS_NS) {
        const handler = function (sender) {
          const h = wnd.div.offsetHeight;
          frame.setAttribute('height', (h - 26) + 'px');
        };
        wnd.addListener(mxEvent.RESIZE_END, handler);
        wnd.addListener(mxEvent.MAXIMIZE, handler);
        wnd.addListener(mxEvent.NORMALIZE, handler);
        wnd.addListener(mxEvent.SHOW, handler);
      }
      this.help = wnd;
    }
    this.help.setVisible(true);
  }

  /**
   * Function: showOutline
   *
   * Shows the outline window. If the window does not exist, then it is
   * created using an <mxOutline>.
   */
  showOutline(): void {
    const create = !this.outline;
    if (create) {
      const div = document.createElement('div');
      div.style.overflow = 'hidden';
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.background = 'white';
      div.style.cursor = 'move';
      if (document.documentMode == 8) {
        div.style.filter = 'progid:DXImageTransform.Microsoft.alpha(opacity=100)';
      }
      const wnd = new mxWindow(mxResources.get(this.outlineResource) || this.outlineResource, div, 600, 480, 200, 200, false);
      const outline = new mxOutline(this.graph, div);
      wnd.setClosable(true);
      wnd.setResizable(true);
      wnd.destroyOnClose = false;
      wnd.addListener(mxEvent.RESIZE_END, function () {
        outline.update();
      });
      this.outline = wnd;
      this.outline.outline = outline;
    }
    this.outline.setVisible(true);
    this.outline.outline.update(true);
  }

  /**
   * Function: setMode
   *
   * Puts the graph into the specified mode. The following modenames are
   * supported:
   *
   * select - Selects using the left mouse button, new connections
   * are disabled.
   * connect - Selects using the left mouse button or creates new
   * connections if mouse over cell hotspot. See <mxConnectionHandler>.
   * pan - Pans using the left mouse button, new connections are disabled.
   */
  setMode(modename: any): void {
    if (modename == 'select') {
      this.graph.panningHandler.useLeftButtonForPanning = false;
      this.graph.setConnectable(false);
    } else if (modename == 'connect') {
      this.graph.panningHandler.useLeftButtonForPanning = false;
      this.graph.setConnectable(true);
    } else if (modename == 'pan') {
      this.graph.panningHandler.useLeftButtonForPanning = true;
      this.graph.setConnectable(false);
    }
  }

  /**
   * Function: createPopupMenu
   *
   * Uses <popupHandler> to create the menu in the graph's
   * panning handler. The redirection is setup in
   * <setToolbarContainer>.
   */
  createPopupMenu(menu: any, cell: mxCell, evt: Event): void {
    this.popupHandler.createMenu(this, menu, cell, evt);
  }

  /**
   * Function: createEdge
   *
   * Uses <defaultEdge> as the prototype for creating new edges
   * in the connection handler of the graph. The style of the
   * edge will be overridden with the value returned by
   * <getEdgeStyle>.
   */
  createEdge(source: any, target: string): mxCell {
    let e = undefined;
    if (!!this.defaultEdge) {
      const model = this.graph.getModel();
      e = model.cloneCell(this.defaultEdge);
    } else {
      e = new mxCell('');
      e.setEdge(true);
      const geo = new mxGeometry();
      geo.relative = true;
      e.setGeometry(geo);
    }
    const style = this.getEdgeStyle();
    if (!!style) {
      e.setStyle(style);
    }
    return e;
  }

  /**
   * Function: getEdgeStyle
   *
   * Returns a string identifying the style of new edges.
   * The function is used in <createEdge> when new edges
   * are created in the graph.
   */
  getEdgeStyle(): any {
    return this.defaultEdgeStyle;
  }

  /**
   * Function: consumeCycleAttribute
   *
   * Returns the next attribute in <cycleAttributeValues>
   * or null, if not attribute should be used in the
   * specified cell.
   */
  consumeCycleAttribute(cell: mxCell): any {
    return (!!this.cycleAttributeValues && this.cycleAttributeValues.length > 0 && this.graph.isSwimlane(cell)) ? this.cycleAttributeValues[this.cycleAttributeIndex++ % this.cycleAttributeValues.length] : null;
  }

  /**
   * Function: cycleAttribute
   *
   * Uses the returned value from <consumeCycleAttribute>
   * as the value for the <cycleAttributeName> key in
   * the given cell's style.
   */
  cycleAttribute(cell: mxCell): void {
    if (!!this.cycleAttributeName) {
      const value = this.consumeCycleAttribute(cell);
      if (!!value) {
        cell.setStyle(cell.getStyle() + ';' + this.cycleAttributeName + '=' + value);
      }
    }
  }

  /**
   * Function: addVertex
   *
   * Adds the given vertex as a child of parent at the specified
   * x and y coordinate and fires an <addVertex> event.
   */
  addVertex(parent: any, vertex: any, x: number, y: number): any {
    const model = this.graph.getModel();
    while (!!parent && !this.graph.isValidDropTarget(parent)) {
      parent = model.getParent(parent);
    }
    parent = (!!parent) ? parent : this.graph.getSwimlaneAt(x, y);
    const scale = this.graph.getView().scale;
    let geo = model.getGeometry(vertex);
    const pgeo = model.getGeometry(parent);
    if (this.graph.isSwimlane(vertex) && !this.graph.swimlaneNesting) {
      parent = undefined;
    } else if (!parent && this.swimlaneRequired) {
      return null;
    } else if (!!parent && !!pgeo) {
      const state = this.graph.getView().getState(parent);
      if (!!state) {
        x -= state.origin.x * scale;
        y -= state.origin.y * scale;
        if (this.graph.isConstrainedMoving) {
          const width = geo.width;
          const height = geo.height;
          let tmp = state.x + state.width;
          if (x + width > tmp) {
            x -= x + width - tmp;
          }
          tmp = state.y + state.height;
          if (y + height > tmp) {
            y -= y + height - tmp;
          }
        }
      } else if (!!pgeo) {
        x -= pgeo.x * scale;
        y -= pgeo.y * scale;
      }
    }
    geo = geo.clone();
    geo.x = this.graph.snap(x / scale - this.graph.getView().translate.x - this.graph.gridSize / 2);
    geo.y = this.graph.snap(y / scale - this.graph.getView().translate.y - this.graph.gridSize / 2);
    vertex.setGeometry(geo);
    if (!parent) {
      parent = this.graph.getDefaultParent();
    }
    this.cycleAttribute(vertex);
    this.fireEvent(new mxEventObject(mxEvent.BEFORE_ADD_VERTEX, 'vertex', vertex, 'parent', parent));
    model.beginUpdate();
    try {
      vertex = this.graph.addCell(vertex, parent);
      if (!!vertex) {
        this.graph.constrainChild(vertex);
        this.fireEvent(new mxEventObject(mxEvent.ADD_VERTEX, 'vertex', vertex));
      }
    } finally {
      model.endUpdate();
    }
    if (!!vertex) {
      this.graph.setSelectionCell(vertex);
      this.graph.scrollCellToVisible(vertex);
      this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
    }
    return vertex;
  }

  /**
   * Function: destroy
   *
   * Removes the editor and all its associated resources. This does not
   * normally need to be called, it is called automatically when the window
   * unloads.
   */
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      if (!!this.tasks) {
        this.tasks.destroy();
      }
      if (!!this.outline) {
        this.outline.destroy();
      }
      if (!!this.properties) {
        this.properties.destroy();
      }
      if (!!this.keyHandler) {
        this.keyHandler.destroy();
      }
      if (!!this.rubberband) {
        this.rubberband.destroy();
      }
      if (!!this.toolbar) {
        this.toolbar.destroy();
      }
      if (!!this.graph) {
        this.graph.destroy();
      }
      this.status = undefined;
      this.templates = undefined;
    }
  }
}
