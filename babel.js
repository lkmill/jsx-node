'use strict';

const babylon = require('babylon');

module.exports = function (babel) {
  const t = babel.types;

  function convertNode(node) {
    if (node.type === 'CallExpression' && node.callee.name === 'h') {
      if (node.arguments[0].type === 'StringLiteral') {
        const tagName = node.arguments[0].value;

        let start = t.stringLiteral(`<${tagName}`);

        if (node.arguments[1]) {
          start = t.binaryExpression('+', start, t.callExpression(t.identifier('props'), [node.arguments[1]]));
        }

        start = t.binaryExpression('+', start, t.stringLiteral('>'));

        const children = node.arguments.slice(2);

        if (children.length) {
          let child;
          while (child = children.shift()) {
            let convertedNode = convertNode(child);

            if (convertedNode.type === 'Identifier') {
              convertedNode = t.callExpression(t.identifier('output'), [ convertedNode ]);
            }

            start = t.binaryExpression('+', start, convertedNode);
          }
        }

        const end = t.stringLiteral(`</${tagName}>`);

        return t.binaryExpression('+', start, end);
      }

      return t.callExpression(t.identifier('output'), node.arguments);
    } else if (node.type === 'LogicalExpression' || node.type === 'MemberExpression') {
      // TODO remember what LogicalExpression is
      // wrap MemberExpressions (eg. `this.member`) in call to `output` helper
      return t.callExpression(t.identifier('output'), [ node ]);
    } else if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      // wrap CallExpressions where callee is MemberExpressions (eg `this.place.map((room) => 'sucks'))`)
      // in call to `output` helper
      return t.callExpression(t.identifier('output'), [ node ]);
    }

    // simply return the node as is
    return node;
  }

  return {
    visitor: {
      CallExpression(path) {
        if (path.node.type === 'CallExpression' && path.node.callee.name === 'h') {
          // only start conversion on h() calls, should always be root h call in here
          path.replaceWith(convertNode(path.node));
        }
      },
      Program: {
        enter(path, parent) {
          const node = path.node;

          // insert helpers at the top of each jsx file
          node.body.unshift(
            babylon.parse('const { props, output } = require("ssjsx/helpers");\n').program.body[0]
          );
        },
      },
    },
  };
};
