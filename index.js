const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const asyncPool = require('tiny-async-pool');
const multimatch = require('multimatch');

/**
 * Resolve user options with sensible defaults.
 *
 * @param {object} options
 */
const resolveOptions = async options => {
  const config = {
    publicPath: 'dist',
    files: ['**/*'],
    clear: true,
    deployPaths: [],
    ...options,
  };
  if (!config.manifest) {
    try {
      const content = await fs.readFile(
        path.join(config.publicPath, 'mix-manifest.json'),
        'utf8'
      );
      config.manifest = JSON.parse(content);
    } catch (error) {
      console.error(error);
    }
  }
  return config;
};

/**
 * Get a list of files, either from the webpack stats or from all matching
 * files inside the publicPath directory.
 *
 * @param {object} config
 */
const getFilePaths = async config => {
  if (config.stats) {
    const files = multimatch(
      Object.keys(config.stats.compilation.assets),
      config.files
    );
    if (config.manifest) {
      return files.map(file => {
        const normalized = file.replace(/^\/?/, '/');
        if (config.manifest[normalized] === undefined) {
          console.error = `No entry in manifest.json for: ${normalized}`;
          return file;
        }
        return config.manifest[normalized].replace(
          /([^.]+)\.([^?]+)\?id=(.+)$/g,
          '$1.$2'
        );
      });
    }
  }

  return globby(config.files, {
    cwd: config.publicPath,
    onlyFiles: true,
  });
};

/**
 * Copy file from location A to location B.
 *
 * @param {object} item
 */
const copyFile = async item => {
  const src = path.join(item.context, item.source);
  const sourceStats = await fs.lstat(src);
  const destinationStats = await fs.lstat(item.destination);
  if (sourceStats.isFile()) {
    const destination = destinationStats.isDirectory()
      ? path.join(item.destination, path.dirname(item.source))
      : item.destination;
    const pathInfo = path.parse(destination);
    if (pathInfo.ext === '') {
      await fs.ensureDir(destination);
      await fs.copy(src, path.join(destination, path.basename(item.source)));
    } else {
      await fs.copy(src, destination);
    }
  }
};

/**
 * Deploy all compiled assets to one or multiple filesystem paths.
 *
 * @param {object} options
 */
const deployToFilesystem = async options => {
  const config = await resolveOptions(options);

  if (config.clear) {
    for (const deployPath of config.deployPaths) {
      await fs.emptyDir(deployPath);
    }
  }

  const files = await getFilePaths(config);
  for (const deployPath of config.deployPaths) {
    await asyncPool(
      5,
      files.map(file => ({
        source: file,
        destination: deployPath,
        context: config.publicPath,
      })),
      copyFile
    );
  }
};

module.exports = deployToFilesystem;
