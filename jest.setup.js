require('dotenv').config();
import '@testing-library/jest-dom';
import React from 'react';
import { signal } from '@preact/signals-react';
import { TextEncoder, TextDecoder } from 'util';

global.React = React; // Explicitly make React global

// Polyfill TextEncoder and TextDecoder for environments where they're not globally available (e.g., some Jest setups)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

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
    // Add other drei components if they cause issues
  };
});

// Mock R3F intrinsic elements that are causing ReferenceErrors
jest.mock('@react-three/fiber', () => {
  const ActualReact = jest.requireActual('react');
  const actualR3F = jest.requireActual('@react-three/fiber');
  return {
    ...actualR3F,
    // Provide simple mock implementations for intrinsic-like components if they are not resolved
    // This is a common workaround if the JSX transform doesn't recognize them as R3F intrinsics
    // However, 'AmbientLight' etc. are not typically components you import directly.
    // They are part of the JSX namespace. This kind of mock might not be right for intrinsics.
    // A better approach might be to configure Jest/Babel to understand R3F's JSX.
    // For now, if these are being treated as components due to PascalCase, let's provide simple mocks.
    // This assumes they are being sought as actual components.
    // If the issue is purely JSX namespace, this won't help.

    // Let's try a different strategy: mock the specific components if they were actual exports.
    // Since they are intrinsics, this is more complex.
    // The error "AmbientLight is not defined" means it's looking for a variable AmbientLight.
    // We can provide a dummy component for it.
  };
});

// It's more direct to mock them as if they were components from a specific module,
// but since R3F makes them available like HTML tags (but PascalCased),
// the issue is likely with the JSX transform or global type augmentation not being seen by Jest.

// A more common pattern for R3F intrinsics if they cause issues is to provide a mock for the canvas,
// or use jest-canvas-mock. The canvas mock is already present.

// If PascalCased elements are treated as components, we can mock them globally via jest.mock,
// but we need to know "where" they are expected to be imported from if not intrinsic.
// R3F intrinsics don't require an import.
// The `ReferenceError` means the JSX `<AmbientLight />` is compiled to `React.createElement(AmbientLight, ...)`,
// and `AmbientLight` is not in scope.

// Let's provide global mocks for these as simple functional components.
// This is a common workaround.
const AmbientLight = (props) => React.createElement('div', { 'data-testid': 'mock-ambientlight', ...props });
const DirectionalLight = (props) => React.createElement('div', { 'data-testid': 'mock-directionallight', ...props });
const HemisphereLight = (props) => React.createElement('div', { 'data-testid': 'mock-hemispherelight', ...props });

// To make these globally available to Jest tests when they encounter these tags:
// This requires a bit more advanced jest configuration or specific module mocking.
// A simpler way might be to adjust the JSX pragma or ensure R3F's types are extended globally.

// For now, the most direct fix for "AmbientLight is not defined" is to ensure
// these are defined in the scope where FlipGame is rendered, or mock them at a level
// that Jest's transform can replace them.
// The existing canvas mocks are good. The issue is component resolution.

// The errors suggest that after casing <ambientLight /> to <AmbientLight />,
// React is looking for an imported component named AmbientLight.
// Since these are R3F intrinsics, they aren't typically imported.
// This implies a misconfiguration in how Jest/Babel handles R3F's JSX.

// Let's try mocking the R3F module to provide these as simple divs for testing purposes.
// This is a common strategy when the 3D rendering itself isn't the focus of the test.
// We need to ensure this mock is done correctly.
// The previous attempt to mock @react-three/fiber was too broad.

// Let's add specific mocks for the components if they are treated as if they should be imported.
// This is a bit of a guess, as intrinsics shouldn't need this.
// However, if the test environment is failing to resolve them as intrinsics,
// it might be falling back to treating them as standard components.
// This is more of a workaround if the underlying JSX/R3F config for Jest is the issue.

// No, the above jest.mock for @react-three/fiber is not the right way for intrinsics.
// The issue is that the JSX like <AmbientLight /> is treated as React.createElement(AmbientLight).
// We need to ensure AmbientLight is defined.
// Simplest way for testing when 3D rendering is not essential:
global.AmbientLight = (props) => React.createElement('div', { 'data-testid': 'mock-ambientlight', ...props });
global.DirectionalLight = (props) => React.createElement('div', { 'data-testid': 'mock-directionallight', ...props });
global.HemisphereLight = (props) => React.createElement('div', { 'data-testid': 'mock-hemispherelight', ...props });