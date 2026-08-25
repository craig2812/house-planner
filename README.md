# House Planner

A browser-based 2D/3D ground-floor planner built with React, TypeScript, Vite and Three.js.

The starter layout is an **approximate, horizontally mirrored interpretation** of the supplied house-plan image, including the garage. Measurements visible in the reference were used where practical; hall/utility/circulation geometry is intentionally easy to tune in the inspector rather than presented as survey-accurate.

## What it does

- Switch between 2D, 3D and split views.
- Drag rooms and furniture in the 2D plan.
- Edit room dimensions, positions, wall heights and floor colours.
- Add rooms and common furniture/space-planning objects.
- Edit furniture size, height, position, rotation and colour.
- View every change immediately in Three.js with orbit/pinch controls.
- Toggle a lower-wall 3D cutaway for easier inspection.
- Snap dragging to a 0.5 m planning grid.
- Auto-save the current plan to browser local storage.
- Export/import plans as JSON.
- Restore the supplied mirrored starter layout at any time.
- Responsive layout for desktop, tablet and mobile.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run build
```

## GitHub Pages

`vite.config.ts` is configured for the project path `/house-planner/` and `.github/workflows/deploy-pages.yml` builds and deploys `dist` when `main` changes.

For a private repository, GitHub Pages requires a plan that supports Pages for private repositories. GitHub also requires Pages to be enabled with **GitHub Actions** as the publishing source in **Settings → Pages** before the standard `GITHUB_TOKEN` deployment can run.

Expected URL once enabled and deployed:

`https://craig2812.github.io/house-planner/`

## Accuracy note

This is a space-planning tool, not architectural/CAD software. Verify important dimensions against measurements, drawings or a survey before construction decisions.
