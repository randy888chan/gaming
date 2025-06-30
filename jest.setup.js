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

// The custom mock for styled-components is removed.
// jest-styled-components, added to setupFilesAfterEnv, will handle necessary setup.

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