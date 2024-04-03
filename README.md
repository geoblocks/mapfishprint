# geoblocks / mapfishprint

Standalone JS library for printing [OpenLayers](https://openlayers.org/) map using [MapFishPrint v3](https://github.com/mapfish/mapfish-print).

Features:

- retrieve MapFishPrint capabilities;
- introspect map / layers and convert them to MapFishPrint spec format;
- customize transformations;
- post report and poll for result;

## Usage

```shell
npm install @geoblocks/mapfishprint
```

See the [live demo](https://geoblocks.github.io/mapfishprint/demo.html) and the [code documentation](https://geoblocks.github.io/mapfishprint/docs/index.html).

## Contributing

### Community

This is an opensource community project for all users of MapfishPrint v3.
We welcome everyone to join forces to discuss, maintain, improve, ... this project.

### Local serve the demo

Run `npm start`.

On code changes, you have to **manually** refresh the page to see your changes.

This demo uses `importmap`, that allow use to have no bundler at all in this project. 
The downside is that we need to specify every imports, and have symlink in the demo
folder  to serve them.

### Run the tests

We use directly node to test the code.

Run `npm test` to run every test suites.

Or npm `run test:debug` and debug it with your `chrome://inspect` tool.

### Publish a new version to npm
￼The source is transpiled to standard ES modules and published on npm.
￼
```bash
# update CHANGES.md
npm version patch
npm publish
git push --tags origin main
```
