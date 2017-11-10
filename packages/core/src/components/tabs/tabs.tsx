import { Component, Element, Event, EventEmitter, Listen, Method, Prop, State } from '@stencil/core';
import { Config, HTMLIonTabElement, NavState, RouterEntries } from '../../index';

export interface NavOptions { }
// import { isPresent } from '../../utils/helpers';

/**
 * @name Tabs
 * @description
 * Tabs make it easy to navigate between different pages or functional
 * aspects of an app. The Tabs component, written as `<ion-tabs>`, is
 * a container of individual [Tab](../Tab/) components. Each individual `ion-tab`
 * is a declarative component for a [NavController](../../../navigation/NavController/)
 *
 * For more information on using nav controllers like Tab or [Nav](../../nav/Nav/),
 * take a look at the [NavController API Docs](../../../navigation/NavController/).
 *
 * ### Placement
 *
 * The position of the tabs relative to the content varies based on
 * the mode. The tabs are placed at the bottom of the screen
 * for iOS and Android, and at the top for Windows by default. The position can
 * be configured using the `tabsPlacement` attribute on the `<ion-tabs>` component,
 * or in an app's [config](../../config/Config/).
 * See the [Input Properties](#input-properties) below for the available
 * values of `tabsPlacement`.
 *
 * ### Layout
 *
 * The layout for all of the tabs can be defined using the `tabsLayout`
 * property. If the individual tab has a title and icon, the icons will
 * show on top of the title by default. All tabs can be changed by setting
 * the value of `tabsLayout` on the `<ion-tabs>` element, or in your
 * app's [config](../../config/Config/). For example, this is useful if
 * you want to show tabs with a title only on Android, but show icons
 * and a title for iOS. See the [Input Properties](#input-properties)
 * below for the available values of `tabsLayout`.
 *
 * ### Selecting a Tab
 *
 * There are different ways you can select a specific tab from the tabs
 * component. You can use the `selectedIndex` property to set the index
 * on the `<ion-tabs>` element, or you can call `select()` from the `Tabs`
 * instance after creation. See [usage](#usage) below for more information.
 *
 * @usage
 *
 * You can add a basic tabs template to a `@Component` using the following
 * template:
 *
 * ```html
 * <ion-tabs>
 *   <ion-tab [root]="tab1Root"></ion-tab>
 *   <ion-tab [root]="tab2Root"></ion-tab>
 *   <ion-tab [root]="tab3Root"></ion-tab>
 * </ion-tabs>
 * ```
 *
 * Where `tab1Root`, `tab2Root`, and `tab3Root` are each a page:
 *
 *```ts
 * @Component({
 *   templateUrl: 'build/pages/tabs/tabs.html'
 * })
 * export class TabsPage {
 *   // this tells the tabs component which Pages
 *   // should be each tab's root Page
 *   tab1Root = Page1;
 *   tab2Root = Page2;
 *   tab3Root = Page3;
 *
 *   constructor() {
 *
 *   }
 * }
 *```
 *
 * By default, the first tab will be selected upon navigation to the
 * Tabs page. We can change the selected tab by using `selectedIndex`
 * on the `<ion-tabs>` element:
 *
 * ```html
 * <ion-tabs selectedIndex="2">
 *   <ion-tab [root]="tab1Root"></ion-tab>
 *   <ion-tab [root]="tab2Root"></ion-tab>
 *   <ion-tab [root]="tab3Root"></ion-tab>
 * </ion-tabs>
 * ```
 *
 * Since the index starts at `0`, this will select the 3rd tab which has
 * root set to `tab3Root`. If you wanted to change it dynamically from
 * your class, you could use [property binding](https://angular.io/docs/ts/latest/guide/template-syntax.html#!#property-binding).
 *
 * Alternatively, you can grab the `Tabs` instance and call the `select()`
 * method. This requires the `<ion-tabs>` element to have an `id`. For
 * example, set the value of `id` to `myTabs`:
 *
 * ```html
 * <ion-tabs #myTabs>
 *   <ion-tab [root]="tab1Root"></ion-tab>
 *   <ion-tab [root]="tab2Root"></ion-tab>
 *   <ion-tab [root]="tab3Root"></ion-tab>
 * </ion-tabs>
 * ```
 *
 * Then in your class you can grab the `Tabs` instance and call `select()`,
 * passing the index of the tab as the argument. Here we're grabbing the tabs
 * by using ViewChild.
 *
 *```ts
 * export class TabsPage {
 *
 * @ViewChild('myTabs') tabRef: Tabs;
 *
 * ionViewDidEnter() {
 *   this.tabRef.select(2);
 *  }
 *
 * }
 *```
 *
 * You can also switch tabs from a child component by calling `select()` on the
 * parent view using the `NavController` instance. For example, assuming you have
 * a `TabsPage` component, you could call the following from any of the child
 * components to switch to `TabsRoot3`:
 *
 *```ts
 * switchTabs() {
 *   this.navCtrl.parent.select(2);
 * }
 *```
 * @demo /docs/demos/src/tabs/
 *
 * @see {@link /docs/components#tabs Tabs Component Docs}
 * @see {@link ../Tab Tab API Docs}
 * @see {@link ../../config/Config Config API Docs}
 *
 */
@Component({
  tag: 'ion-tabs',
  styleUrls: {
    ios: 'tabs.ios.scss',
    md: 'tabs.md.scss',
    wp: 'tabs.wp.scss'
  }
})
export class Tabs {

  private ids: number = -1;
  private tabsId: number = (++tabIds);
  private selectHistory: string[] = [];

  @Element() el: HTMLElement;

  @State() tabs: HTMLIonTabElement[] = [];
  @State() selectedTab: HTMLIonTabElement;

  @Prop({ context: 'config' }) config: Config;

  /**
   * @input {string} A unique name for the tabs
   */
  @Prop() name: string;

  /**
   * @input {boolean} If true, the tabbar
   */
  @Prop() tabbarHidden = false;

  /**
   * @input {string} Set the tabbar layout: `icon-top`, `icon-start`, `icon-end`, `icon-bottom`, `icon-hide`, `title-hide`.
   */
  @Prop({ mutable: true }) tabbarLayout: string;

  /**
   * @input {string} Set position of the tabbar: `top`, `bottom`.
   */
  @Prop({ mutable: true }) tabbarPlacement: string;

  /**
   * @input {boolean} If true, show the tab highlight bar under the selected tab.
   */
  @Prop({ mutable: true }) tabbarHighlight: boolean;

  /**
   * @output {any} Emitted when the tab changes.
   */
  @Event() ionChange: EventEmitter;
  @Event() ionNavChanged: EventEmitter;

  protected ionViewDidLoad() {
    this.loadConfig('tabsPlacement', 'bottom');
    this.loadConfig('tabsLayout', 'icon-top');
    this.loadConfig('tabsHighlight', true);


    // this.tabs = (Array.from(this.el.children) as HTMLIonTabElement[])
    // .filter(e => e.tagName === 'ION-TAB');

    // for (let tab of this.tabs) {
    //   const id = `t-${this.tabsId}-${++this.ids}`;
    //   tab.btnId = 'tab-' + id;
    //   tab.id = 'tabpanel-' + id;
    // }
    // TODO: handle navigation parent
    //   if (this.parent) {
    //     // this Tabs has a parent Nav
    //     this.parent.registerChildNav(this);

    //   } else if (viewCtrl && viewCtrl.getNav()) {
    //     // this Nav was opened from a modal
    //     this.parent = <any>viewCtrl.getNav();
    //     this.parent.registerChildNav(this);

    //   } else if (this._app) {
    //     // this is the root navcontroller for the entire app
    //     this._app.registerRootNav(this);
    //   }

    //   // Tabs may also be an actual ViewController which was navigated to
    //   // if Tabs is static and not navigated to within a NavController
    //   // then skip this and don't treat it as it's own ViewController
    //   if (viewCtrl) {
    //     viewCtrl._setContent(this);
    //     viewCtrl._setContentRef(elementRef);
    //   }
    // }
    if (Context.useRouter !== true) {
      this.initTabs();
    }
  }

  protected ionViewDidUnload() {
    this.tabs = this.selectedTab = null;
  }

  @Listen('ionTabbarClick')
  @Listen('ionSelect')
  tabChange(ev: CustomEvent) {
    const selectedTab = ev.detail as HTMLIonTabElement;
    this.select(selectedTab);
  }

  @Listen('ionTabDidLoad')
  protected addTab(ev: CustomEvent) {
    const tab = ev.detail as HTMLIonTabElement;
    const id = `t-${this.tabsId}-${++this.ids}`;
    tab.btnId = 'tab-' + id;
    tab.id = 'tabpanel-' + id;
    this.tabs = [...this.tabs, tab];
    ev.stopPropagation();
  }

  @Listen('ionTabDidUnload')
  protected removeTab(ev: CustomEvent) {
    const tab = ev.detail;
    this.tabs.slice(this.tabs.indexOf(tab));
    ev.stopPropagation();
  }

  /**
   * @param {number|Tab} tabOrIndex Index, or the Tab instance, of the tab to select.
   */
  @Method()
  select(tabOrIndex: number | HTMLIonTabElement): Promise<any> {
    const selectedTab = (typeof tabOrIndex === 'number' ? this.getByIndex(tabOrIndex) : tabOrIndex);
    if (!selectedTab) {
      return Promise.resolve();
    }

    // Reset rest of tabs
    for (let tab of this.tabs) {
      if (selectedTab !== tab) {
        tab.selected = false;
      }
    }
    selectedTab.selected = true;

    if (this.selectedTab === selectedTab) {
      return selectedTab.goToRoot();
    } else {
      const leavingTab = this.selectedTab;
      let promise = selectedTab._setActive(true);
      if (leavingTab) {
        promise = promise.then(() => leavingTab._setActive(false));
      }
      promise = promise.then(() => {
        return new Promise((resolve) => {
          this.ionChange.emit(selectedTab);
          this.ionNavChanged.emit({ isPop: false });
          resolve();
        });
      });
      this.selectedTab = selectedTab;
      this.selectHistory.push(selectedTab.id);
      return promise;
    }
  }


   /**
   * @param {number} index Index of the tab you want to get
   * @returns {HTMLIonTabElement} Returns the tab who's index matches the one passed
   */
  @Method()
  getByIndex(index: number): HTMLIonTabElement {
    return this.tabs[index];
  }

  /**
   * @return {HTMLIonTabElement} Returns the currently selected tab
   */
  @Method()
  getSelected(): HTMLIonTabElement {
    return this.tabs.find((tab) => tab.selected);
  }

  @Method()
  getIndex(tab: HTMLIonTabElement): number {
    return this.tabs.indexOf(tab);
  }

  @Method()
  getTabs(): HTMLIonTabElement[] {
    return this.tabs;
  }

  private initTabs() {
    // find pre-selected tabs
    let selectedTab = this.tabs.find(t => t.selected);

    // reset all tabs none is selected
    for (let tab of this.tabs) {
      tab.selected = false;
    }

    // find a tab candidate in case, the selected in null
    if (!selectedTab) {
      selectedTab = this.tabs.find(t => t.show && t.enabled);
    }
    selectedTab._setActive(true);
    this.selectedTab = selectedTab;
    this.selectHistory.push(selectedTab.id);
  }

  private loadConfig(attrKey: string, fallback: any) {
    const val = (this as any)[attrKey];
    if (typeof val === 'undefined') {
      (this as any)[attrKey] = this.config.get(attrKey, fallback);
    }
  }

  /**
   * Get the previously selected Tab which is currently not disabled or hidden.
   * @param {boolean} trimHistory If the selection history should be trimmed up to the previous tab selection or not.
   * @returns {HTMLIonTabElement}
   */
  @Method()
  previousTab(trimHistory: boolean = true): HTMLIonTabElement {
    // walk backwards through the tab selection history
    // and find the first previous tab that is enabled and shown
    for (var i = this.selectHistory.length - 2; i >= 0; i--) {
      var id = this.selectHistory[i];
      var tab = this.tabs.find(t => t.id === id);
      if (tab && tab.enabled && tab.show) {
        if (trimHistory) {
          this.selectHistory.splice(i + 1);
        }
        return tab;
      }
    }
    return null;
  }

  @Method()
  getState(): NavState {
    const selectedTab = this.getSelected();
    if (!selectedTab) {
      return null;
    }
    return {
      path: selectedTab.path,
      focusNode: selectedTab
    };
  }

  @Method()
  getRoutes(): RouterEntries {
    return this.tabs.map(t => {
      return {
        path: t.path,
        id: t
      };
    });
  }

  @Method()
  setRouteId(id: any, _: any = {}): Promise<any> {
    if (this.selectedTab === id) {
      return Promise.resolve();
    }
    return this.select(id).then(() => this.getState());
  }

  protected render() {
    const dom = [
      <div class='tabs-inner'>
        <slot></slot>
      </div>];
    if (!this.tabbarHidden) {
      dom.push(
        <ion-tabbar
          tabs={this.tabs}
          selectedTab={this.selectedTab}
          highlight={this.tabbarHighlight}
          placement={this.tabbarPlacement}
          layout={this.tabbarLayout}>
        </ion-tabbar>
      );
    }
    return dom;
  }
}

let tabIds = -1;
