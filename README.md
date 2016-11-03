# jsx-node: Node JSX

Use JSX as a template engine in Node.

This module enables requiring `.jsx` files in Node. It does this by using
[babel](https://github.com/babel/babel) and
[babel-plugin-transform-react-jsx](https://www.npmjs.com/package/babel-plugin-transform-react-jsx)
to first transform [jsx](https://jsx.github.io/) into
[hyperscript](https://github.com/dominictarr/hyperscript), and then transform
all `h()` calls in the resulting hyperscript into more efficient string
concatenations.

## Warning! This is a Proof of Concept

This module is still in a very early phase. Any production use should
be approached with caution.

## Basic Use

To be able to simply require `.jsx` files, you need
to tell Node what to do with them. Running the following code makes you
able to `require('./SomeFile.jsx')`:

```js
require('jsx-node').install({
  replace: {
    preact: 'jsx-node',
  }
});
```

As you can see, you are able to pass some options. The default options are:

```js
const defaultOptions = {
  extension: '.jsx',
  presets: [ 'es2015-node6' ],
  plugins: [
    'add-module-exports',
  ],
};
```

`options` passed to the `install` method are assigned/extended with
`defaultOptions`, not (deeply) merged. If you want to add a new plugin or
preset, but still use the default ones you have to explicitly send all defaults
in your array.

## Stateless & ES6 Components recommended

To make the the most efficient and simplest use of this library, make sure you
only use stateless or ES6 class components.

For ES6 Class Modules, make sure the initial state is set in the constructor and
nowhere else.

## Compatible With Preact

This module is designed to be compatible with [Preact](https://github.com/developit/preact).

+ `className` prop is aliased to `class`, and `class` can be a plain object.
  any keys with truthy values will be used as a class.

## Usage With Express

### `server.js`

```js
'use strict';

// make node understand `*.jsx` files
require('jsx-node/node-require').install();

const chalk = require('chalk');
const express = require('express');

const server = express();

// override default response render method
server.response.render = require('./render.jsx');

// load routes
server.use(require('./router'));

// get port from env or use default
const port = process.env.PORT || 1337;

// start server, save reference to HTTP Server instance returned
server.http = server.listen(port, () => {
  console.info(`[${chalk.cyan('INIT')}] HTTP Server listening on port ${chalk.magenta(port)} (${chalk.yellow(server.get('env'))})`);
});

// export instance of server if needed by other modules
module.exports = server;
```

### `render.jsx`

If all our jsx files adhere to stateless and ES6 Classes, the following code works
great to override the default express rendering logic.

```js
'use strict';

module.exports = function (Component, Master) {
  if (typeof Component !== 'function') throw new Error('Not a Component');

  const locals = Object.assign({}, this.app.locals, this.locals);

  if (typeof Master === 'function') {
    this.send('<!doctype html>' + (
      <Master {...locals}>
        <Component {...locals} />
      </Master>
    ));
  } else if (Component.prototype && Component.prototype.render) {
    const i = new Component(locals);
    this.send(i.render(i.props, i.state));
  } else {
    this.send(Component(this.props));
  }
};
```

### `router.js`

```js
'use strict';

const Contact = require('./Contact.jsx');
const Index = require('./Index.jsx');
const Master = require('./Master.jsx');

const router = new (require('express')).Router();

router.get('/', (req, res, next) => {
  res.render(Index, Master);
});

router.get('/contact', (req, res, next) => {
  res.render(Contact, Master);
});


module.exports = router;
```

## TODO

+ Write tests

### babel plugin

+ Escape unsafe code insert, but enable injecting of html from variables like
  `regions`
+ Use custom Component class (needs to be done in babel plugin)
+ Remove all methods on class components except constructor and render, but
  keep all methods used in those
+ Remove all dependencies not used in methods from above point
