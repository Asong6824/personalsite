# ThreeUI Bookshelf source notice

The renderer in this directory is adapted from `BookshelfScene` in
[`@designcodeio/threeui`](https://github.com/MengTo/threeui), Community release
`1.2.0` (upstream snapshot `68802d5428071ada5c20db8094b1649e6bb770ed`).

The book geometry, page-flex algorithm, materials, lighting, camera motion and
pointer/keyboard state machine remain substantially upstream code. Local changes
are intentionally limited to:

- use the site's existing Three.js runtime instead of the upstream `three165` alias;
- scope a DOM lookup to the component host;
- load presentation-independent book metadata and individual cover URLs from
  the site's shared `BookshelfBook` model;
- keep the wood texture as a cacheable local asset and retain procedural cloth
  covers as the failure fallback;
- provide a Next.js client boundary and site-specific accessible controls.

The original cover atlas and the wood texture in `public/life/bookshelf/` are
ThreeUI-authored Community scene assets and are included under the same MIT
license. The atlas is retained as an upstream reference but is no longer loaded
at runtime.

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
