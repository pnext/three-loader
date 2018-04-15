# README

This project is based on the core/loading parts of Potree [Potree](http://potree.org/), converted to
Typescript for usage directly in ThreeJS-based third party applications.

Suggestions for better/easier APIs or new features, as well as PRs, are very welcome!

# Usage

```typescript
import { PointCloudOctree, Potree } from '@pix4d/three-potree-loader';

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
    scene.add(pco);

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

# Thank You!

Thank you to Markus Schütz for his work on Potree, on which this project is based.

# Work with us

We use this as part of our 3D model viewer at Pix4D (http://www.pix4d.com). If you would like to
work with us on some awesome GIS and Photogrametry visualization and measurement/analysis tools,
check our WebGL Web Developer job opening: https://pix4d.workable.com/j/654F8D2A74
