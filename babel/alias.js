'use strict';

module.exports = function () {
  return {
    visitor: {
      CallExpression(path, state) {
        const node = path.node;

        if (node.type === 'CallExpression'
          && state.opts.replace
          && node.callee.type === 'Identifier'
          && node.callee.name === 'require'
          && node.arguments.length === 1
          && node.arguments[0].type === 'StringLiteral'
        ) {
          const keys = Object.keys(state.opts.replace);

          const found = keys.find((key) => node.arguments[0].value.startsWith(key));

          if (found) {
            const pathArray = node.arguments[0].value.split('/').slice(1);
            node.arguments[0].value = state.opts.replace[found] + (pathArray.length ? `/${pathArray.join('/')}` : '');
          }
        }
      },
    },
  };
};
