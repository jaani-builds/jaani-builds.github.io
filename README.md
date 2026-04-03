# Interactive Resume Template

This project is a reusable resume website template.

The app is driven by a single JSON file and a PDF file. In most cases, a new user only needs to:

1. Update `data/resume.json`
2. Upload a PDF into `assets/resume/`
3. Set `pdfUrl` in `data/resume.json`

No code changes are required for normal reuse.

## Two Data Versions

This repository keeps two resume datasets:

- `data/resume.json`: active profile used by the app
- `data/resume.template.json`: reusable generic template profile

To switch to the generic template version:

```bash
cp data/resume.template.json data/resume.json
```

Then update `data/resume.json` with your own details.

## What Is Included

- Tabbed resume layout with responsive sections
- About, Experience, Education, Skills, Certifications, Recommendations, and Experiments sections
- Expand/collapse interactions for Experience and Skills
- Optional LinkedIn recommendations widget support
- Docker support for local preview and Render deployment

## Project Structure

- `index.html`: entry point
- `assets/css/style.css`: layout and styling
- `assets/js/main.js`: rendering and interactions
- `data/resume.json`: all resume content and optional labels/meta
- `assets/resume/`: place your downloadable PDF here
- `Dockerfile`: local Docker preview image
- `Dockerfile.prod`: production Docker image
- `render.yaml`: Render deployment config

## Quick Start

1. Open `data/resume.json`
2. Replace the personal details with your own
3. Update the section arrays and objects with your own content
4. Upload your PDF to `assets/resume/`
5. Update `pdfUrl` to point to that file
6. Open `index.html` in a browser or run it with Docker

## `resume.json` Guide

Required core fields:

- `basics.name`
- `basics.role`
- `summary`
- `pdfUrl`

Useful optional fields:

- `basics.email`
- `basics.phone`
- `basics.linkedin`
- `basics.github`
- `meta.title`
- `meta.description`
- `sectionLabels`
- `recommendationsWidget`

Section behavior:

- Empty sections are automatically hidden from the navigation
- About is always shown
- Skills categories are rendered as collapsible groups
- Recommendations can come from manual entries or a widget embed

## PDF Setup

Place your resume PDF inside `assets/resume/`, for example:

```text
assets/resume/my-resume.pdf
```

Then set:

```json
"pdfUrl": "assets/resume/my-resume.pdf"
```

## Optional Recommendations Widget

The Recommendations tab supports widget embeds from:

- `sociablekit`
- `elfsight`

Example configuration:

```json
"recommendationsWidget": {
  "enabled": true,
  "provider": "sociablekit",
  "widgetId": "YOUR_WIDGET_ID",
  "profileUrl": "https://www.linkedin.com/in/your-profile/details/recommendations/"
}
```

If the widget is disabled or missing an ID, the app falls back to manual entries in `recommendations`.

## Run Locally

Open `index.html` directly in a browser, or use Docker.

Local Docker preview:

```bash
docker build -t resume-local .
docker run --rm -p 8080:8000 resume-local
```

Visit `http://localhost:8080`.

## Deploy With Docker

Production image:

```bash
docker build -f Dockerfile.prod -t resume-prod .
docker run --rm -p 8080:8000 resume-prod
```

The production image serves the site with Python's built-in HTTP server and honors the `PORT` environment variable.

## Deploy To Render

This repository includes `render.yaml`.

It deploys as a Docker web service using `Dockerfile.prod`.

Key settings:

- `env: docker`
- `dockerfilePath: ./Dockerfile.prod`
- `healthCheckPath: /`

## Template Notes

- Fonts, layout, and interactions are generic and reusable
- Section labels can be overridden through `sectionLabels`
- Page title and meta description can be overridden through `meta`
- You can remove entire sections by deleting or emptying them in `resume.json`
