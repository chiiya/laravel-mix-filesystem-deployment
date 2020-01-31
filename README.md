<br />
<div align="center">
  <p align="center">
    <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/license-MIT-green.svg"></a>
    <a href="https://www.npmjs.com/package/laravel-mix-filesystem-deployment" target="_blank"><img src="https://img.shields.io/npm/v/laravel-mix-filesystem-deployment.svg"></a>
    <a href="https://prettier.io" target="_blank"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat"></a>
  </p>

  <strong>
    <h2 align="center">Laravel Mix Filesystem Deployment</h2>
  </strong>

  <p align="center">
    Laravel Mix plugin for copying compiled asset files to one or multiple deployment 
    paths on the filesystem.
  </p>

  <p align="center">
    <strong>
    <a href="#installation">installation</a>
      &nbsp; &middot; &nbsp;
      <a href="#usage">usage</a>
      &nbsp; &middot; &nbsp;
      <a href="#options">options</a>
      &nbsp; &middot; &nbsp;
      <a href="#example">example</a>
    </strong>
  </p>
</div>
<br />

## Installation

<pre>npm install <a href="https://www.npmjs.com/package/laravel-mix-filesystem-deployment">laravel-mix-filesystem-deployment</a></pre>

## Usage

```js
mix.then(async stats => {
  const deploy = require('laravel-mix-filesystem-deployment');
  await deploy({
    deployPaths: ['/home/user/mounts/dev/acme'],
  });
});
```

## Options

Configure the plugin by passing an options object as the first argument.

| Option            | Default                                             | Details                                                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stats`           | `undefined`                                         | Webpack stats containing information for all compiled assets. **When the stats object is passed, only compiled assets will be copied.** If no stats are passed, all files in the `publicPath` folder matching the `files` pattern are copied. |
| `publicPath`      | `dist`                                              | Public path where the compiled assets (and the `mix-manifest.json`) are located.                                                                                                                                                              |
| `files`           | `['**/*']`                                          | Whitelist of files that should be copied.                                                                                                                                                                                                     |
| `clear`           | true                                                | Should the `deployPath` directory be cleared before copying files?                                                                                                                                                                            |
| `manifest`        | `mix-manifest.json` inside the `publicPath` folder. | Contents of your `mix-manifest.json` file.                                                                                                                                                                                                    |
| **`deployPaths`** | `[]`                                                | **REQUIRED**. List of paths where the assets should be copied to.                                                                                                                                                                             |

## Example

The following example copies only the compiled assets during the current webpack
incremental build for development mode, but clears the directory and copies
_all_ files for production mode.

```js
const mix = require('laravel-mix');

const config = {
  srcPath: 'src',
  distPath: 'dist',
  deployPaths: ['/home/user/mounts/dev/acme'],
};

const source = {
  images: path.resolve(config.srcPath, 'images'),
  scripts: path.resolve(config.srcPath, 'js'),
  styles: path.resolve(config.srcPath, 'css'),
  templates: path.resolve(config.srcPath, 'templates'),
};

mix.then(async stats => {
  const deploy = require('laravel-mix-filesystem-deployment');
  await deploy({
    clear: Mix.inProduction(),
    stats: Mix.inProduction() ? undefined : stats,
    deployPaths: config.deployPaths,
  });
});
```
