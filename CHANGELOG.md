# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.14](https://github.com/pnext/three-loader/compare/v0.5.13...v0.5.14) (2025-07-29)


### Features

* **gaussians:** modify the load function for gaussians to obtain the max amount of splats ([7307cac](https://github.com/pnext/three-loader/commit/7307cac45578d023ba83bf3848914af4aab1a38e))
* **gaussians:** separate the harmonics from mobile ([9a84904](https://github.com/pnext/three-loader/commit/9a849040c579d539bf19fc4c58456cd3b9c88dd7))
* **GS:** correcting adaptive LOD scaling ([5ec79c5](https://github.com/pnext/three-loader/commit/5ec79c5b252b97d83026053fe25a5f5d7a1af9b1))
* **GS:** define the maxDepth only in geometry ([217317c](https://github.com/pnext/three-loader/commit/217317c12bfddbeda92a190ae9c697e14222d793))
* **GS:** include the position change for the conditions of sorting ([88c958e](https://github.com/pnext/three-loader/commit/88c958e9013d5d2abf40b1ea6a68789e36db8fb9))
* **GS:** remove the testing true in the sorter ([86188a8](https://github.com/pnext/three-loader/commit/86188a83ffc17dc68f0d5fd2ff9171d838dff316))
* **GS:** remove unused variables ([a4710db](https://github.com/pnext/three-loader/commit/a4710db054d9687098845a4eabf9bd969ff9ce15))
* let an xhr override ([#211](https://github.com/pnext/three-loader/issues/211)) ([6609df4](https://github.com/pnext/three-loader/commit/6609df48342a7b747a027c8ba5893ce4d182d8ae))


### Dependencies updates

* bump on-headers and compression ([#213](https://github.com/pnext/three-loader/issues/213)) ([a69eefb](https://github.com/pnext/three-loader/commit/a69eefbd2162260d86fbb1941135212d88ef19b2))

### [0.5.13](https://github.com/pnext/three-loader/compare/v0.5.12...v0.5.13) (2025-07-17)


### Features

* **GS:** include the clipping for the splats ([57b39b8](https://github.com/pnext/three-loader/commit/57b39b89ecbce8d7d5e32cc395b6206f9c3c7746))

### [0.5.12](https://github.com/pnext/three-loader/compare/v0.5.11...v0.5.12) (2025-07-16)


### Features

* **GS:** reduce max splats for mobile to 500K ([f2183b6](https://github.com/pnext/three-loader/commit/f2183b6449bb0b07f1ef96355ac2e88dcc65e1b2))

### [0.5.11](https://github.com/pnext/three-loader/compare/v0.5.10...v0.5.11) (2025-07-16)


### Features

* **GS:** reduce memory footprint for mobile ([a14d551](https://github.com/pnext/three-loader/commit/a14d5510556c840660ea675c75bfa06b61cbf1c3))

### [0.5.10](https://github.com/pnext/three-loader/compare/v0.5.9...v0.5.10) (2025-07-14)


### Features

* **model:** disable harmonics in shader when required ([3eb7ad8](https://github.com/pnext/three-loader/commit/3eb7ad8eb5e21cfa3da09b3ca022b2c6e1c924d5))

### [0.5.9](https://github.com/pnext/three-loader/compare/v0.5.8...v0.5.9) (2025-07-07)


### Features

* **model:** modify format for splats texture ([a57186d](https://github.com/pnext/three-loader/commit/a57186d90709ad861880d73e8619bbd7cdf5c868))

### [0.5.8](https://github.com/pnext/three-loader/compare/v0.5.6...v0.5.8) (2025-07-03)


### Features

* **model:** modify the sorter for bundle ([648bbbc](https://github.com/pnext/three-loader/commit/648bbbc75bec5af6c9e651e3a01757beeac2c671))
* **model:** update the function that checks if the splats are required ([f78a910](https://github.com/pnext/three-loader/commit/f78a910cf1a4fbb112262bf1a53d45b8a9a6cecb))
* reduce artifact size ([d2fb6ed](https://github.com/pnext/three-loader/commit/d2fb6edae06e41f7bb3e3f8617d8d915d1ad83d6))
* update pointcloud shaders to GLSL3 ([6ef3489](https://github.com/pnext/three-loader/commit/6ef3489346e9343272e8bb32a5a7d206aeda1fed))


### Bug Fixes

* fix wepback sourcemap annotations breaking stuff ([5c4e379](https://github.com/pnext/three-loader/commit/5c4e3794a6301597fdccb5e72554f0b4ac680999))
* use xhrRequest for loading Potree2 hierarchy and octree ([eb29a17](https://github.com/pnext/three-loader/commit/eb29a1763b2dce8b18bacb35544ecbe26a6ad993))

### [0.5.6](https://github.com/pnext/three-loader/compare/v0.5.5...v0.5.6) (2025-06-25)

### [0.5.5](https://github.com/pnext/three-loader/compare/v0.5.4...v0.5.5) (2025-06-20)


### Dependencies updates

* **deps-dev:** rimraf from 3.0.2 to 6.0.1 ([#198](https://github.com/pnext/three-loader/issues/198)) ([8c8d6dd](https://github.com/pnext/three-loader/commit/8c8d6dd37ee0effc9034447ab424afc65ecfff82))

### [0.5.4](https://github.com/pnext/three-loader/compare/v0.5.3...v0.5.4) (2025-06-20)

### [0.5.3](https://github.com/pnext/three-loader/compare/v0.5.2...v0.5.3) (2025-06-20)

### [0.5.2](https://github.com/pnext/three-loader/compare/v0.5.1...v0.5.2) (2025-06-20)

### [0.2.10](https://github.com/pnext/three-loader/compare/v0.2.5...v0.2.10) (2024-04-05)

### [0.2.1](https://github.com/pnext/three-loader/compare/v0.2.1-beta.1...v0.2.1) (2020-06-04)

### [0.2.2](https://github.com/pnext/three-loader/compare/v0.2.1...v0.2.2) (2020-09-28)

### [0.1.9](https://github.com/pnext/three-loader/compare/v0.1.8...v0.1.9) (2020-03-16)

### [0.1.8](https://github.com/pnext/three-loader/compare/v0.1.6...v0.1.8) (2020-03-04)

### [0.1.7](https://github.com/pnext/three-loader/compare/v0.1.6...v0.1.7) (2019-12-09)

### [0.1.6](https://github.com/pnext/three-loader/compare/v0.1.5...v0.1.6) (2019-11-25)

### [0.1.5](https://github.com/pnext/three-loader/compare/v0.1.4...v0.1.5) (2019-09-30)

### [0.1.4](https://github.com/pnext/three-loader/compare/v0.1.3...v0.1.4) (2019-08-15)


### Bug Fixes

* free more memory and prevent infinite loop when doing so ([437ebea](https://github.com/pnext/three-loader/commit/437ebea))

### [0.1.3](https://github.com/pnext/three-loader/compare/v0.1.2...v0.1.3) (2019-08-07)


### Bug Fixes

* **lru:** collect all the nodes to remove and then remove them in one go ([4dcd3d4](https://github.com/pnext/three-loader/commit/4dcd3d4))

### [0.1.2](https://github.com/pnext/three-loader/compare/v0.1.0...v0.1.2) (2019-08-07)


### Bug Fixes

* clipping of nodes when CLIP_OUTSIDE is set ([#45](https://github.com/pnext/three-loader/issues/45)) ([cf72aeb](https://github.com/pnext/three-loader/commit/cf72aeb))
* **point-cloud-material:** define MAX_POINT_LIGHTS and MAX_DIR_LIGHTS ([#40](https://github.com/pnext/three-loader/issues/40)) ([3d3306e](https://github.com/pnext/three-loader/commit/3d3306e))
* **pointcloud.vert:** use snake_case for max_clip_boxes ([#42](https://github.com/pnext/three-loader/issues/42)) ([6a39757](https://github.com/pnext/three-loader/commit/6a39757))

## [0.1.1](https://github.com/pnext/three-loader/compare/v0.1.0...v0.1.1) (2019-04-03)


### Bug Fixes

* **point-cloud-material:** define MAX_POINT_LIGHTS and MAX_DIR_LIGHTS ([#40](https://github.com/pnext/three-loader/issues/40)) ([3d3306e](https://github.com/pnext/three-loader/commit/3d3306e))



# [0.1.0](https://github.com/pnext/three-loader/compare/v0.0.19...v0.1.0) (2019-04-02)


### Features

* **point-cloud-octree:** add `pixelPosition` and `onBeforePickRender` to pick params ([#36](https://github.com/pnext/three-loader/issues/36)) ([0369286](https://github.com/pnext/three-loader/commit/0369286))



## [0.0.19](https://github.com/pnext/three-loader/compare/v0.0.18...v0.0.19) (2019-04-01)


### Bug Fixes

* **material:** prevent warnings about unused varyings ([#38](https://github.com/pnext/three-loader/issues/38)) ([1e74717](https://github.com/pnext/three-loader/commit/1e74717))
