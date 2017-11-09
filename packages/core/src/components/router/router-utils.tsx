import { StencilElement } from '../../index';

export interface NavElement extends StencilElement {
  setRouteId(id: any, data?: any): Promise<NavState>;
  getRoutes(): RouterEntries;
  getState(): NavState;
}

export interface RouterEntry {
  path: string;
  id: any;
  segments?: string[];
  props?: any;
}

export type RouterEntries = RouterEntry[];

export interface NavState {
  path: string;
  focusNode: HTMLElement;
}

export interface RouteMatch {

}

export class RouterSegments {
  constructor(
    private segments: string[]
  ) {}

  next(): string {
    if (this.segments.length > 0) {
      return this.segments.shift();
    }
    return '';
  }
}

const navs = ['ION-NAV', 'ION-TABS'];

export function parseURL(url: string): string[] {
  if (url === null || url === undefined) {
    return [''];
  }
  const segments = url.split('/')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (segments.length === 0) {
    return [''];
  } else {
    return segments;
  }
}

export function breadthFirstSearch(root: HTMLElement): NavElement {
  if (!root) {
    return null;
  }
  // we do a Breadth-first search
  // Breadth-first search (BFS) is an algorithm for traversing or searching tree
  // or graph data structures.It starts at the tree root(or some arbitrary node of a graph,
  // sometimes referred to as a 'search key'[1]) and explores the neighbor nodes
  // first, before moving to the next level neighbours.

  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    // visit node
    if (navs.indexOf(node.tagName) >= 0) {
      return node as NavElement;
    }

    // queue children
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      queue.push(children.item(i) as NavElement);
    }
  }
  return null;
}
