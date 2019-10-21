/**
 * Class: mxUrlConverter
 *
 * Converts relative and absolute URLs to absolute URLs with protocol and domain.
 */
export class mxUrlConverter {
  /**
   * Variable: enabled
   *
   * Specifies if the converter is enabled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: baseUrl
   *
   * Specifies the base URL to be used as a prefix for relative URLs.
   */
  baseUrl: string;
  /**
   * Variable: baseDomain
   *
   * Specifies the base domain to be used as a prefix for absolute URLs.
   */
  baseDomain: any;

  /**
   * Function: updateBaseUrl
   *
   * Private helper function to update the base URL.
   */
  updateBaseUrl(): void {
    this.baseDomain = location.protocol + '//' + location.host;
    this.baseUrl = this.baseDomain + location.pathname;
    const tmp = this.baseUrl.lastIndexOf('/');
    if (tmp > 0) {
      this.baseUrl = this.baseUrl.substring(0, tmp + 1);
    }
  }

  /**
   * Function: isEnabled
   *
   * Returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Sets <enabled>.
   */
  setEnabled(value: any): void {
    this.enabled = value;
  }

  /**
   * Function: getBaseUrl
   *
   * Returns <baseUrl>.
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Function: setBaseUrl
   *
   * Sets <baseUrl>.
   */
  setBaseUrl(value: any): void {
    this.baseUrl = value;
  }

  getBaseDomain(): any {
    return this.baseDomain;
  }

  /**
   * Function: setBaseDomain
   *
   * Sets <baseDomain>.
   */
  setBaseDomain(value: any): void {
    this.baseDomain = value;
  }

  /**
   * Function: isRelativeUrl
   *
   * Returns true if the given URL is relative.
   */
  isRelativeUrl(url: string): string {
    return url.substring(0, 2) != '//' && url.substring(0, 7) != 'http://' && url.substring(0, 8) != 'https://' && url.substring(0, 10) != 'data:image' && url.substring(0, 7) != 'file://';
  }

  /**
   * Function: convert
   *
   * Converts the given URL to an absolute URL with protol and domain.
   * Relative URLs are first converted to absolute URLs.
   */
  convert(url: string): any {
    if (this.isEnabled() && this.isRelativeUrl(url)) {
      if (!this.getBaseUrl()) {
        this.updateBaseUrl();
      }
      if (url.charAt(0) == '/') {
        url = this.getBaseDomain() + url;
      } else {
        url = this.getBaseUrl() + url;
      }
    }
    return url;
  }
}
