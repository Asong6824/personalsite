# ThreeUI Meng To Sketchbook source notice

The React component and imperative renderer in this directory are adapted from
[`MengToSketchbookLandingPage`](https://threeui.com/landing-pages/meng-to-sketchbook-landing-page)
in [`@designcodeio/threeui`](https://github.com/MengTo/threeui), Community release
`1.2.0` (upstream snapshot `68802d5428071ada5c20db8094b1649e6bb770ed`).

The page-strip geometry, curl and spring algorithm, per-strip lighting,
pointer/keyboard state machine, tilt, zoom, magnifier and scene CSS remain
substantially upstream code. Local integration is intentionally limited to:

- expose spreads as typed React data with page-change and page-open callbacks;
- retain the original animation loop as a disposable imperative renderer;
- isolate the original scene CSS in an open Shadow DOM instead of an iframe;
- preload the current/adjacent spreads before revealing the scene and defer the rest;
- provide Next.js deep linking, loading state, route metadata and return control.

The included images and textures are ThreeUI-authored Community assets under
the MIT license below. Instrument Serif and Newsreader are distributed under
the SIL Open Font License 1.1; the complete font license is retained in
`FONT-LICENSES.md`.

## MIT License

Copyright (c) 2026 Meng To

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
