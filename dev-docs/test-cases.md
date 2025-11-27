# Project Test Cases

This document outlines the comprehensive test strategy for the Personal Site project, based on the project structure and navigation documentation.

## 1. Global Navigation & Layout

### 1.1 Navbar (`src/components/layout/Navbar.jsx`)
- [ ] **Visibility**: Verify Navbar is present on all pages.
- [ ] **Links**:
    - [ ] **Home** (`/#hero`): Scrolls to top on Homepage; navigates to `/` from other pages.
    - [ ] **About** (`/#about`): Scrolls to About section on Homepage.
    - [ ] **Tech Stack** (`/#programmer-details`): Scrolls to Tech Stack section.
    - [ ] **Footprints** (`/#footprints`): Scrolls to Footprints section.
    - [ ] **Blog** (`/blog`): Navigates to the Blog Homepage.
- [ ] **Logo Interaction**: Clicking the logo should return to Homepage top (`#hero`).
- [ ] **Responsive Menu**: Verify hamburger menu/mobile layout works on small screens.

### 1.2 Footer
- [ ] **Copyright**: Verify year and copyright text are correct.
- [ ] **Links**: Verify any external links (GitHub, Socials) work.

## 2. Homepage (`src/app/page.js`)

### 2.1 Hero Section
- [ ] **Content**: Verify "且听松涛" title and intro text.
- [ ] **Visuals**: Check background/hero image rendering.

### 2.2 About Me Section (`src/components/features/AboutMeSection.jsx`)
- [ ] **Content**: Verify bio text.
- [ ] **Interactivity**:
    - [ ] **Tech Channel Button**: Click "Tech" button -> Navigates to `/blog/tech`.
    - [ ] **Life Channel Button**: Click "Life" button -> Navigates to `/blog/life`.

### 2.3 Other Sections
- [ ] **Tech Stack**: Verify list of technologies is rendered.
- [ ] **Footprints**: Verify map/location data is displayed.
- [ ] **Active Days**: Verify activity graph/stats are visible.
- [ ] **Latest Posts**: Verify the "Latest Posts" section links to correct articles.

## 3. Blog System Core

### 3.1 Blog Homepage (`src/app/blog/page.jsx`)
- [ ] **Channel Entry**: Verify full-screen background links for Tech, Life, Finance.
- [ ] **Timeline**: Verify articles are grouped by year.
- [ ] **Article Links**: Click an article in the timeline -> Navigates to `/blog/<channel>/<column>/<slug>`.

### 3.2 Column Aggregation (`src/app/blog/columns/page.jsx`)
- [ ] **List View**: Verify all columns from all channels are listed.
- [ ] **Counts**: Verify article counts for each column are correct.
- [ ] **Links**: Click a column -> Navigates to `/blog/<channel>/<column>`.

## 4. Channel & Column Pages

### 4.1 Channel Pages
- [ ] **Tech Channel** (`/blog/tech`):
    - [ ] Verify list of Tech columns.
    - [ ] Verify "View All" links navigate to specific columns.
- [ ] **Life Channel** (`/blog/life`):
    - [ ] Verify list of Life columns.
- [ ] **Finance Channel** (`/blog/finance`):
    - [ ] Verify list of Finance columns.

### 4.2 Column Pages (`/blog/[channel]/[columnSlug]`)
- [ ] **Rendering**: Navigate to a valid column (e.g., `/blog/tech/devtools`).
    - [ ] Verify Column Title and Description.
    - [ ] Verify list of articles belongs to this column.
- [ ] **Validation**: Navigate to an invalid column (e.g., `/blog/tech/invalid-col`) -> Verify 404 Page.

## 5. Article Details

### 5.1 Standard Article (`/blog/[channel]/[columnSlug]/[postSlug]`)
- [ ] **Tech Post**: Open a tech article.
    - [ ] Verify Title, Date, Tags.
    - [ ] Verify MDX content rendering (Code blocks, Headers).
- [ ] **Life Post**: Open a life article.
    - [ ] **Tag Validation**: Ensure article tags match the column's allowed tags.
- [ ] **Finance Post**: Open a finance article.
    - [ ] Verify content.

### 5.2 Generic Article (`/blog/[slug]`)
- [ ] **Access**: Navigate to `/blog/<slug>` (e.g., for a post not in a specific column or legacy URL).
- [ ] **Rendering**: Verify content loads correctly.

### 5.3 Article Features
- [ ] **Back Link**: Verify "Back to Blog" or "Back to Column" link works.
- [ ] **Music Player**: If `music` frontmatter is present, verify player appears.
- [ ] **Metadata**: Verify page title matches article title (Browser Tab).

## 6. Dev & Demo Pages

### 6.1 Datasets Demo (`src/app/dev/datasets-demo/page.jsx`)
- [ ] **Access**: Navigate to `/dev/datasets-demo`.
- [ ] **Functionality**: Verify Stock Comparison chart renders and interacts.

## 7. Technical & SEO

### 7.1 Metadata & SEO
- [ ] **Titles**: Verify unique titles for Home, Blog, Channels, and Articles.
- [ ] **Descriptions**: Verify meta descriptions are present.

### 7.2 Error Handling
- [ ] **404 Page**:
    - [ ] Visit `/non-existent-page`.
    - [ ] Visit `/blog/tech/non-existent-column`.
    - [ ] Visit `/blog/tech/devtools/non-existent-post`.
    - [ ] Verify custom 404 UI (or Next.js default if custom not implemented).

### 7.3 Performance
- [ ] **Images**: Verify lazy loading for large images.
- [ ] **Navigation**: Verify client-side navigation (SPA feel) without full page reload.
