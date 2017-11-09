import { Component, Listen, Prop } from '@stencil/core';
import { NavElement, NavState, RouterEntry, RouterSegments, breadthFirstSearch, parseURL } from './router-utils';
import { RouterEntries } from '../../index';

/**
  * @name RouterController
  * @module ionic
  * @description
 */
@Component({
  tag: 'ion-router-controller'
})
export class RouterController {

  private busy = false;
  private enabled = false;

  @Prop() fragment: boolean = true;

  constructor() {
    this.enabled = Context.useRouter === true;
  }

  ionViewDidLoad() {
    Context.dom.raf(() => this.writeNavStateRoot());
  }

  @Listen('window:hashchange')
  protected onURLHashChanged() {
    if (this.busy || !this.enabled) {
      return;
    }
    this.writeNavStateRoot();
  }

  @Listen('body:ionNavChanged')
  protected onNavChanged(ev: CustomEvent) {
    if (this.busy || !this.enabled) {
      return;
    }
    console.log('Updating URL based in NAVS change');
    const detail = ev.detail;
    const isPop = detail.isPop === true;
    const stack: NavState[] = [];
    const pivot = this.readNavState(stack);
    if (pivot) {
      this.writeNavState(pivot, []);
    }
    const url = ('#/' + stack
      .map(s => parseURL(s.path).join('/'))
      .join('/'));

    if (isPop) {
      window.history.back();
      window.history.replaceState(null, null, url);
    } else {
      window.history.pushState(null, null, url);
    }
  }


  private writeNavStateRoot(): Promise<any> {
    const node = document.querySelector('ion-app') as HTMLElement;
    return this.writeNavState(node, this.readURL());
  }

  private writeNavState(node: HTMLElement, url: string[]): Promise<any> {
    const segments = new RouterSegments(url);
    this.busy = true; //  prevents reentrance
    return writeNavState(node, segments)
      .then(() => console.log('app updated based in URL'))
      .catch(err => console.error(err))
      .then(() => this.busy = false);
  }

  private readNavState(stack: NavState[]): NavElement {
    let node = document.querySelector('ion-app') as HTMLElement;
    while (true) {
      const pivot = breadthFirstSearch(node);
      if (pivot) {
        const state = pivot.getState();
        if (state) {
          node = state.focusNode;
          stack.push(state);
        } else {
          return pivot;
        }
      } else {
        break;
      }
    }
    return null;
  }

  private readURL(): string[] {
    let url: string;
    if (this.fragment) {
      url = window.location.hash.substr(1);
    } else {
      url = window.location.pathname;
    }
    return parseURL(url);
  }
}

function writeNavState(root: HTMLElement, segments: RouterSegments): Promise<void> {
  const node = breadthFirstSearch(root);
  if (!node) {
    return Promise.resolve();
  }
  return node.componentOnReady()
    .then(() => node.getRoutes())
    .then(routes => match(segments, routes))
    .then(route => node.setRouteId(route.id))
    .then(s => writeNavState(s.focusNode, segments));
}


function match(segments: RouterSegments, routes: RouterEntries): RouterEntry {
  let index = 0;
  routes = routes.map(initRoute);
  let selectedRoute: RouterEntry = null;
  let ambiguous = false;
  let segment: string;
  let l: number;

  while (true) {
    routes = routes.filter(r => r.segments.length > index);
    if (routes.length === 0) {
      break;
    }
    segment = segments.next();
    routes = routes.filter(r => r.segments[index] === segment);
    l = routes.length;
    if (l === 0) {
      selectedRoute = null;
      ambiguous = false;
    } else {
      selectedRoute = routes[0];
      ambiguous = l > 1;
    }
    index++;
  }
  if (ambiguous) {
    console.warn('ambiguious match');
  }
  if (!selectedRoute) {
    throw new Error('no route matched');
  }
  return selectedRoute;
}

function initRoute(route: RouterEntry): RouterEntry {
  if (route.segments === undefined) {
    route.segments = parseURL(route.path);
  }
  return route;
}
