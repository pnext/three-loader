# README

This project is based on the core/loading parts of [Potree](http://potree.org/), converted to Typescript for usage directly in ThreeJS-based third-party applications.

This project focuses solely on the loading of point clouds into ThreeJS applications and doesn't try to provide other things which are available in Potree: earth controls, measurement tools, elevation profiles, etc.

If you have a need for such auxiliary components/tools, we would most definitely welcome contributions, potentially as part of another project under the PNext organization.

And of course, suggestions for better/easier APIs or new features, as well as PRs, are very welcome too!

# Usage

```typescript
import { Scene } from 'three';
import { PointCloudOctree, Potree } from '@pnext/three-loader';

const scene = new Scene();
// Manages the necessary state for loading/updating one or more point clouds.
const potree = new Potree();
// Show at most 2 million points.
potree.pointBudget = 2_000_000;
// List of point clouds which we loaded and need to update.
const pointClouds: PointCloudOctree[] = [];

potree
  .loadPointCloud(
    // The name of the point cloud which is to be loaded.
    'cloud.js',
    // Given the relative URL of a file, should return a full URL (e.g. signed).
    (relativeUrl) => `${baseUrl}${relativeUrl}`,
  )
  .then((pco) => {
    pointClouds.push(pco);
    scene.add(pco); // Add the loaded point cloud to your ThreeJS scene.

    // The point cloud comes with a material which can be customized directly.
    // Here we just set the size of the points.
    pco.material.size = 1.0;
  });

function update() {
  // This is where most of the potree magic happens. It updates the visiblily of the octree nodes
  // based on the camera frustum and it triggers any loads/unloads which are necessary to keep the
  // number of visible points in check.
  potree.updatePointClouds(pointClouds, camera, renderer);

  // Render your scene as normal
  renderer.clear();
  renderer.render(scene, camera);
}
```

You can play with a live example here: https://codesandbox.io/s/yw2p3446j9?autoresize=1&view=preview

# Local Development

Before pushing your changes, you can run these checks locally:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format
```

## Pre-commit Hooks

This repository uses Husky and lint-staged to automatically format and lint your code before each commit.

## Configuration

- Linting rules are defined in `tslint.json`
- Formatting rules are defined in `.prettierrc`
- Files ignored by Prettier are listed in `.prettierignore`
- lint-staged configuration is defined in `.lintstagedrc`

Once that is done you can start a development server by running:

```bash
npm run start
```

You can also start the example application (`/example`) by running:

```bash
npm run start:example
```

To create a production-ready build of the library which can be published to NPM, you can run the following command:

```bash
npm run build
```

# Publishing a New Version of the Library

To publish a new version of the library, follow these steps:

1. Ensure all changes are committed and the codebase is in a clean state.

2. Run the command `npm run release` in your terminal.

- This command will handle the necessary steps to prepare the release, such as updating the version number, generating changelogs, and tagging the release.

3. After the command completes successfully, push the changes and tags to the remote repository.

4. Finally run `npm publish`.

# Thank You!

Thank you to Markus Schütz for his work on Potree, on which this project is based.

# Contribution Guidelines

We welcome contributions to this project! Here are the types of contributions we encourage:

- **Bug Fixes**: If you find any bugs or issues in the code, feel free to submit a fix.
- **Small Improvements**: Suggestions or implementations of minor enhancements to improve the codebase or functionality are highly appreciated.

Please ensure your contributions align with the project's coding standards and include appropriate tests where applicable.

# Contributors

## Pix4D

We use this as part of our online 3D model viewer (http://cloud.pix4d.com).

## Georepublic
