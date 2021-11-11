# README

This project is based on the core/loading parts of [Potree](http://potree.org/), converted to Typescript for usage directly in ThreeJS-based third-party applications.

This project focuses solely on the loading of point clouds into ThreeJS applications and doesn't try to provide other things which are available in Potree: earth controls, measurement tools, elevation profiles, etc.

And of course, suggestions for better/easier APIs or new features, as well as PRs, are very welcome too!

# Usage

```typescript
import { Scene } from 'three';
import { PointCloudOctree, Potree } from 'resonai/three-loader';

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
    relativeUrl => `${baseUrl}${relativeUrl}`,
  )
  .then(pco => {
    pointClouds.push(pco);
    scene.add(pco); // Add the loaded point cloud to your ThreeJS scene.

    // The point cloud comes with a material which can be customized directly.
    // Here we just set the size of the points.
    pco.material.size = 1.0;
  });

function update() {
  // This is where most of the potree magic happens. It updates the visibility of the octree nodes
  // based on the camera frustum and it triggers any loads/unloads which are necessary to keep the
  // number of visible points in check.
  potree.updatePointClouds(pointClouds, camera, renderer);

  // Render your scene as normal
  renderer.clear();
  renderer.render(scene, camera);
}
```
# Local Development

To develop and contribute to the project, you need to start by cloning the repository and then install all the dependencies with yarn:

```bash
> yarn
```

Once that is done you can start a development server by running:

```bash
> yarn start
```

You can also start the example application (`/example`) by running:

```bash
> yarn start:example
```
And run it by going to http://localhost:5050

To create a production-ready build of the library which can be published to NPM, you can run the following command:

```bash
> yarn build
```

# Thank You!

Thank you to Markus Schütz for his work on Potree, on which this project is based.

Thank you to the original repository by [PNext](https://github.com/pnext)