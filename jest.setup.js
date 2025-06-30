import '@testing-library/jest-dom';
import React from 'react';
import { signal } from '@preact/signals-react';

global.React = React; // Explicitly make React global

jest.mock('@preact/signals-react', () => ({
  signal: jest.fn((initialValue) => ({
    value: initialValue,
    subscribe: jest.fn(),
    valueOf: jest.fn(() => initialValue),
    toString: jest.fn(() => String(initialValue)),
  })),
  effect: jest.fn(),
  useSignal: jest.fn((initialValue) => ({ value: initialValue })),
  computed: jest.fn((fn) => ({ // Ensure computed is mocked as a function that returns a signal-like object
    value: fn(),
    subscribe: jest.fn(),
    valueOf: jest.fn(() => fn()),
    toString: jest.fn(() => String(fn())),
  })),
}));

// Mock styled-components
jest.mock('styled-components', () => {
  const ActualReact = jest.requireActual('react');

  // This is the actual React component that our styled mock will render.
  // It's a forwardRef component to properly handle refs and filter transient props.
  const MockRenderedComponent = ActualReact.forwardRef(({ as: Component = 'div', children, ...props }, ref) => {
    const filteredProps = Object.keys(props).reduce((acc, key) => {
      if (key.startsWith('$')) {
        return acc;
      }
      acc[key] = props[key];
      return acc;
    }, {});
    return ActualReact.createElement(Component, { ...filteredProps, ref }, children);
  });

  // This function creates a "styled" function for a given HTML tag or React Component.
  // This is what `styled.div` or `styled(Component)` will return.
  const createStyledTagMock = (Component) => {
    // This function will be called with template literals (e.g., `styled.div`css``)
    // It needs to return a React component that can be rendered.
    const StyledTag = jest.fn((...args) => {
      // When styled.div`...` is called, args[0] is an array of strings (the template literals)
      // In this case, we return the MockRenderedComponent directly.
      if (Array.isArray(args[0]) && typeof args[0][0] === 'string') {
        return MockRenderedComponent;
      }
      // If it's called as a component (e.g., <StyledDiv />), then args[0] will be the props.
      // We pass these props to our MockRenderedComponent.
      return ActualReact.createElement(MockRenderedComponent, { as: Component, ...args[0] });
    });

    // Attach .attrs and .withConfig to allow chaining.
    // They should return the `StyledTag` itself to continue the chain.
    StyledTag.attrs = jest.fn(() => StyledTag);
    StyledTag.withConfig = jest.fn(() => StyledTag);

    return StyledTag;
  };

  // The main `styled` object that will be the default export.
  // We explicitly define methods for common HTML tags.
  const styled = {
    a: createStyledTagMock('a'),
    abbr: createStyledTagMock('abbr'),
    address: createStyledTagMock('address'),
    area: createStyledTagMock('area'),
    article: createStyledTagMock('article'),
    aside: createStyledTagMock('aside'),
    audio: createStyledTagMock('audio'),
    b: createStyledTagMock('b'),
    base: createStyledTagMock('base'),
    bdi: createStyledTagMock('bdi'),
    bdo: createStyledTagMock('bdo'),
    blockquote: createStyledTagMock('blockquote'),
    body: createStyledTagMock('body'),
    br: createStyledTagMock('br'),
    button: createStyledTagMock('button'),
    canvas: createStyledTagMock('canvas'),
    caption: createStyledTagMock('caption'),
    cite: createStyledTagMock('cite'),
    code: createStyledTagMock('code'),
    col: createStyledTagMock('col'),
    colgroup: createStyledTagMock('colgroup'),
    data: createStyledTagMock('data'),
    datalist: createStyledTagMock('datalist'),
    dd: createStyledTagMock('dd'),
    del: createStyledTagMock('del'),
    details: createStyledTagMock('details'),
    dfn: createStyledTagMock('dfn'),
    dialog: createStyledTagMock('dialog'),
    div: createStyledTagMock('div'),
    dl: createStyledTagMock('dl'),
    dt: createStyledTagMock('dt'),
    em: createStyledTagMock('em'),
    embed: createStyledTagMock('embed'),
    fieldset: createStyledTagMock('fieldset'),
    figcaption: createStyledTagMock('figcaption'),
    figure: createStyledTagMock('figure'),
    footer: createStyledTagMock('footer'),
    form: createStyledTagMock('form'),
    h1: createStyledTagMock('h1'),
    h2: createStyledTagMock('h2'),
    h3: createStyledTagMock('h3'),
    h4: createStyledTagMock('h4'),
    h5: createStyledTagMock('h5'),
    h6: createStyledTagMock('h6'),
    head: createStyledTagMock('head'),
    header: createStyledTagMock('header'),
    hgroup: createStyledTagMock('hgroup'),
    hr: createStyledTagMock('hr'),
    html: createStyledTagMock('html'),
    i: createStyledTagMock('i'),
    iframe: createStyledTagMock('iframe'),
    img: createStyledTagMock('img'),
    input: createStyledTagMock('input'),
    ins: createStyledTagMock('ins'),
    kbd: createStyledTagMock('kbd'),
    keygen: createStyledTagMock('keygen'),
    label: createStyledTagMock('label'),
    legend: createStyledTagMock('legend'),
    li: createStyledTagMock('li'),
    link: createStyledTagMock('link'),
    main: createStyledTagMock('main'),
    map: createStyledTagMock('map'),
    mark: createStyledTagMock('mark'),
    menu: createStyledTagMock('menu'),
    menuitem: createStyledTagMock('menuitem'),
    meta: createStyledTagMock('meta'),
    meter: createStyledTagMock('meter'),
    nav: createStyledTagMock('nav'),
    noscript: createStyledTagMock('noscript'),
    object: createStyledTagMock('object'),
    ol: createStyledTagMock('ol'),
    optgroup: createStyledTagMock('optgroup'),
    option: createStyledTagMock('option'),
    output: createStyledTagMock('output'),
    p: createStyledTagMock('p'),
    param: createStyledTagMock('param'),
    picture: createStyledTagMock('picture'),
    pre: createStyledTagMock('pre'),
    progress: createStyledTagMock('progress'),
    q: createStyledTagMock('q'),
    rp: createStyledTagMock('rp'),
    rt: createStyledTagMock('rt'),
    ruby: createStyledTagMock('ruby'),
    s: createStyledTagMock('s'),
    samp: createStyledTagMock('samp'),
    script: createStyledTagMock('script'),
    section: createStyledTagMock('section'),
    select: createStyledTagMock('select'),
    small: createStyledTagMock('small'),
    source: createStyledTagMock('source'),
    span: createStyledTagMock('span'),
    strong: createStyledTagMock('strong'),
    style: createStyledTagMock('style'),
    sub: createStyledTagMock('sub'),
    summary: createStyledTagMock('summary'),
    sup: createStyledTagMock('sup'),
    table: createStyledTagMock('table'),
    tbody: createStyledTagMock('tbody'),
    td: createStyledTagMock('td'),
    textarea: createStyledTagMock('textarea'),
    tfoot: createStyledTagMock('tfoot'),
    th: createStyledTagMock('th'),
    thead: createStyledTagMock('thead'),
    time: createStyledTagMock('time'),
    title: createStyledTagMock('title'),
    tr: createStyledTagMock('tr'),
    track: createStyledTagMock('track'),
    u: createStyledTagMock('u'),
    ul: createStyledTagMock('ul'),
    'var': createStyledTagMock('var'),
    video: createStyledTagMock('video'),
    wbr: createStyledTagMock('wbr'),
    // SVG
    circle: createStyledTagMock('circle'),
    clipPath: createStyledTagMock('clipPath'),
    defs: createStyledTagMock('defs'),
    ellipse: createStyledTagMock('ellipse'),
    g: createStyledTagMock('g'),
    image: createStyledTagMock('image'),
    line: createStyledTagMock('line'),
    linearGradient: createStyledTagMock('linearGradient'),
    mask: createStyledTagMock('mask'),
    path: createStyledTagMock('path'),
    pattern: createStyledTagMock('pattern'),
    polygon: createStyledTagMock('polygon'),
    polyline: createStyledTagMock('polyline'),
    radialGradient: createStyledTagMock('radialGradient'),
    rect: createStyledTagMock('rect'),
    stop: createStyledTagMock('stop'),
    svg: createStyledTagMock('svg'),
    text: createStyledTagMock('text'),
    tspan: createStyledTagMock('tspan'),
  };

  // Also handle `styled(Component)` syntax by making the default export a function
  const defaultStyled = jest.fn((Component) => createStyledTagMock(Component));
  defaultStyled.attrs = jest.fn(() => defaultStyled);
  defaultStyled.withConfig = jest.fn(() => defaultStyled);

  return {
    __esModule: true,
    default: defaultStyled,
    ...styled,
    css: jest.fn(() => ''), // Mock css helper
    keyframes: jest.fn(() => ''), // Mock keyframes helper
  };
});

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: [] })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  scale: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  strokeText: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  createLinearGradient: jest.fn(),
  createRadialGradient: jest.fn(),
  createPattern: jest.fn(),
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
  resetTransform: jest.fn(),
  roundRect: jest.fn(),
  ellipse: jest.fn(),
  arcTo: jest.fn(),
  direction: 'ltr',
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  filter: 'none',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  strokeStyle: '#000',
  fillStyle: '#000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
}));

// Mock OffscreenCanvas
global.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: [] })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: [] })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      scale: jest.fn(),
  translate: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      strokeText: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
      bezierCurveTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      createLinearGradient: jest.fn(),
      createRadialGradient: jest.fn(),
      createPattern: jest.fn(),
      setLineDash: jest.fn(),
      getLineDash: jest.fn(() => []),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      resetTransform: jest.fn(),
      roundRect: jest.fn(),
      ellipse: jest.fn(),
      arcTo: jest.fn(),
      direction: 'ltr',
  font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      filter: 'none',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      strokeStyle: '#000',
      fillStyle: '#000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
    }));
  }
};

global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

jest.mock('gamba-react-ui-v2', () => ({
  ...jest.requireActual('gamba-react-ui-v2'),
  GambaUi: {
    ...jest.requireActual('gamba-react-ui-v2').GambaUi,
    Responsive: ({ children }) => <div data-testid="gamba-ui-responsive">{children}</div>,
    Canvas: ({ render }) => {
      const ActualReact = jest.requireActual('react');
      const canvasRef = ActualReact.useRef(null);
      ActualReact.useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          // Mock the render function if needed, or just ensure it's present
        }
      }, [render]);
      return <canvas ref={canvasRef} data-testid="gamba-ui-canvas" />;
    },
  },
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  }),
}));

jest.mock('@react-three/drei', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...jest.requireActual('@react-three/drei'),
    Text: ({ children, ...props }) => ActualReact.createElement('div', props, children),
  };
});