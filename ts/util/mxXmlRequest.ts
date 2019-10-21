/**
 * Class: mxXmlRequest
 *
 * XML HTTP request wrapper. See also: <mxUtils.get>, <mxUtils.post> and
 * <mxUtils.load>. This class provides a cross-browser abstraction for Ajax
 * requests.
 *
 * Encoding:
 *
 * For encoding parameter values, the built-in encodeURIComponent JavaScript
 * method must be used. For automatic encoding of post data in <mxEditor> the
 * <mxEditor.escapePostData> switch can be set to true (default). The encoding
 * will be carried out using the conte type of the page. That is, the page
 * containting the editor should contain a meta tag in the header, eg.
 * <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
 *
 * Example:
 *
 * (code)
 * var onload = function(req)
 * {
 *   mxUtils.alert(req.getDocumentElement());
 * }
 *
 * var onerror = function(req)
 * {
 *   mxUtils.alert('Error');
 * }
 * new mxXmlRequest(url, 'key=value').send(onload, onerror);
 * (end)
 *
 * Sends an asynchronous POST request to the specified URL.
 *
 * Example:
 *
 * (code)
 * var req = new mxXmlRequest(url, 'key=value', 'POST', false);
 * req.send();
 * mxUtils.alert(req.getDocumentElement());
 * (end)
 *
 * Sends a synchronous POST request to the specified URL.
 *
 * Example:
 *
 * (code)
 * var encoder = new mxCodec();
 * var result = encoder.encode(graph.getModel());
 * var xml = encodeURIComponent(mxUtils.getXml(result));
 * new mxXmlRequest(url, 'xml='+xml).send();
 * (end)
 *
 * Sends an encoded graph model to the specified URL using xml as the
 * parameter name. The parameter can then be retrieved in C# as follows:
 *
 * (code)
 * string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);
 * (end)
 *
 * Or in Java as follows:
 *
 * (code)
 * String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8").replace("\n", "&#xa;");
 * (end)
 *
 * Note that the linefeeds should only be replaced if the XML is
 * processed in Java, for example when creating an image.
 *
 * Constructor: mxXmlRequest
 *
 * Constructs an XML HTTP request.
 *
 * Parameters:
 *
 * url - Target URL of the request.
 * params - Form encoded parameters to send with a POST request.
 * method - String that specifies the request method. Possible values are
 * POST and GET. Default is POST.
 * async - Boolean specifying if an asynchronous request should be used.
 * Default is true.
 * username - String specifying the username to be used for the request.
 * password - String specifying the password to be used for the request.
 */
import { mxClient } from '../mxClient';
import { mxUtils } from './mxUtils';

export class mxXmlRequest {
  constructor(url: string, params: any, method: any, async: any, username: any, password: any) {
    this.url = url;
    this.params = params;
    this.method = method || 'POST';
    this.async = (!!async) ? async : true;
    this.username = username;
    this.password = password;
  }

  url: string;
  params: any;
  method: any;
  async: any;
  username: any;
  password: any;
  /**
   * Variable: binary
   *
   * Boolean indicating if the request is binary. This option is ignored in IE.
   * In all other browsers the requested mime type is set to
   * text/plain; charset=x-user-defined. Default is false.
   */
  binary: boolean = POST;
  /**
   * Variable: withCredentials
   *
   * Specifies if withCredentials should be used in HTML5-compliant browsers. Default is
   * false.
   */
  withCredentials: boolean;
  /**
   * Variable: request
   *
   * Holds the inner, browser-specific request object.
   */
  request: any;
  /**
   * Variable: decodeSimulateValues
   *
   * Specifies if request values should be decoded as URIs before setting the
   * textarea value in <simulate>. Defaults to false for backwards compatibility,
   * to avoid another decode on the server this should be set to true.
   */
  decodeSimulateValues: boolean;
  /**
   * Function: create
   *
   * Creates and returns the inner <request> object.
   */
  create: any;

  /**
   * Function: isBinary
   *
   * Returns <binary>.
   */
  isBinary(): boolean {
    return this.binary;
  }

  /**
   * Function: setBinary
   *
   * Sets <binary>.
   */
  setBinary(value: any): void {
    this.binary = value;
  }

  /**
   * Function: getText
   *
   * Returns the response as a string.
   */
  getText(): any {
    return this.request.responseText;
  }

  /**
   * Function: isReady
   *
   * Returns true if the response is ready.
   */
  isReady(): boolean {
    return this.request.readyState == 4;
  }

  /**
   * Function: getDocumentElement
   *
   * Returns the document element of the response XML document.
   */
  getDocumentElement(): any {
    const doc = this.getXml();
    if (!!doc) {
      return doc.documentElement;
    }
    return null;
  }

  /**
   * Function: getXml
   *
   * Returns the response as an XML document. Use <getDocumentElement> to get
   * the document element of the XML document.
   */
  getXml(): string {
    let xml = this.request.responseXML;
    if (document.documentMode >= 9 || !xml || !xml.documentElement) {
      xml = mxUtils.parseXml(this.request.responseText);
    }
    return xml;
  }

  /**
   * Function: getStatus
   *
   * Returns the status as a number, eg. 404 for "Not found" or 200 for "OK".
   * Note: The NS_ERROR_NOT_AVAILABLE for invalid responses cannot be cought.
   */
  getStatus(): any {
    return this.request.status;
  }

  /**
   * Function: send
   *
   * Send the <request> to the target URL using the specified functions to
   * process the response asychronously.
   *
   * Note: Due to technical limitations, onerror is currently ignored.
   *
   * Parameters:
   *
   * onload - Function to be invoked if a successful response was received.
   * onerror - Function to be called on any error.
   * timeout - Optional timeout in ms before calling ontimeout.
   * ontimeout - Optional function to execute on timeout.
   */
  send(onload: any, onerror: any, timeout: any, ontimeout: any): void {
    this.request = this.create();
    if (!!this.request) {
      if (!!onload) {
        this.request.onreadystatechange = () => {
          if (this.isReady()) {
            onload(this);
            this.request.onreadystatechaange = undefined;
          }
        };
      }
      this.request.open(this.method, this.url, this.async, this.username, this.password);
      this.setRequestHeaders(this.request, this.params);
      if (window.XMLHttpRequest && this.withCredentials) {
        this.request.withCredentials = 'true';
      }
      if (!mxClient.IS_QUIRKS && (!document.documentMode || document.documentMode > 9) && window.XMLHttpRequest && !!timeout && !!ontimeout) {
        this.request.timeout = timeout;
        this.request.ontimeout = ontimeout;
      }
      this.request.send(this.params);
    }
  }

  /**
   * Function: setRequestHeaders
   *
   * Sets the headers for the given request and parameters. This sets the
   * content-type to application/x-www-form-urlencoded if any params exist.
   *
   * Example:
   *
   * (code)
   * request.setRequestHeaders = function(request, params)
   * {
   *   if (!!params)
   *   {
   *     request.setRequestHeader('Content-Type',
   *             'multipart/form-data');
   *     request.setRequestHeader('Content-Length',
   *             params.length);
   *   }
   * };
   * (end)
   *
   * Use the code above before calling <send> if you require a
   * multipart/form-data request.
   */
  setRequestHeaders(request: any, params: any): void {
    if (!!params) {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
  }

  /**
   * Function: simulate
   *
   * Creates and posts a request to the given target URL using a dynamically
   * created form inside the given document.
   *
   * Parameters:
   *
   * docs - Document that contains the form element.
   * target - Target to send the form result to.
   */
  simulate(doc: any, target: string): void {
    doc = doc || document;
    let old = undefined;
    if (doc == document) {
      old = window.onbeforeunload;
      window.onbeforeunload = undefined;
    }
    const form = doc.createElement('form');
    form.setAttribute('method', this.method);
    form.setAttribute('action', this.url);
    if (!!target) {
      form.setAttribute('target', target);
    }
    form.style.display = 'none';
    form.style.visibility = 'hidden';
    const pars = (this.params.indexOf('&') > 0) ? this.params.split('&') : this.params.split();
    for (let i = 0; i < pars.length; i++) {
      const pos = pars[i].indexOf('=');
      if (pos > 0) {
        const name = pars[i].substring(0, pos);
        let value = pars[i].substring(pos + 1);
        if (this.decodeSimulateValues) {
          value = decodeURIComponent(value);
        }
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('wrap', 'off');
        textarea.setAttribute('name', name);
        mxUtils.write(textarea, value);
        form.appendChild(textarea);
      }
    }
    doc.body.appendChild(form);
    form.submit();
    if (!!form.parentNode) {
      form.parentNode.removeChild(form);
    }
    if (!!old) {
      window.onbeforeunload = old;
    }
  }
}
