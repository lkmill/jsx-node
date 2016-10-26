'use strict';

const babylon = require('babylon');
const config = require('./config');

module.exports = function (babel) {
  const t = babel.types;

  function merge(n1, n2) {
    if (n1.type === 'BinaryExpression' && n2.type === 'BinaryExpression') {
      if (n1.right.type === 'StringLiteral' && n2.left.type === 'StringLiteral') {
        n1.right.value += n2.left.value;

        return t.binaryExpression('+', n1, n2.right);
      }

      let right = n1.right;

      while (right.type === 'BinaryExpression') {
        right = right.right;
      }

      let left = n2.left;
      let parent = n2;
      let grandpa = n2.parent;

      while (left.type === 'BinaryExpression') {
        grandpa = parent;
        parent = left;
        left = left.left;
      }

      if (right.type === 'StringLiteral' && left.type === 'StringLiteral') {
        right.value += left.value;

        if (grandpa) {
          grandpa.left = parent.right;
        } else {
          left.value = '';
        }
      }
    } else if (n1.type === 'StringLiteral' && n2.type === 'BinaryExpression' && n2.left.type === 'StringLiteral') {
      if (n2.left.type === 'StringLiteral') {
        return t.binaryExpression('+', t.stringLiteral(n1.value + n2.left.value), n2.right);
      }

      let left = n2.left;
      let parent = n2;
      let grandpa = n2.parent;

      while (left.type === 'BinaryExpression') {
        grandpa = parent;
        parent = left;
        left = left.left;
      }

      if (left.type === 'StringLiteral') {
        n1.value += left.value;

        if (grandpa) {
          grandpa.left = parent.right;
        } else {
          left.value = '';
        }
      }
    } else if (n1.type === 'BinaryExpression' && n2.type === 'StringLiteral') {
      if (n1.right.type === 'StringLiteral') {
        return t.binaryExpression('+', n1.left, t.stringLiteral(n1.right.value + n2.value));
      }

      let right = n1.right;

      while (right.type === 'BinaryExpression') {
        right = right.right;
      }

      if (right.type === 'StringLiteral') {
        right.value += n2.value;

        return n1;
      }
    } else if (n1.type === 'StringLiteral' && n2.type === 'StringLiteral') {
      return t.stringLiteral(n1.value + n2.value);
    }

    return t.binaryExpression('+', n1, n2);
  }

  function convertNode(node) {
    if (node.type === 'CallExpression' && node.callee.name === 'h') {
      if (node.arguments[0].type === 'StringLiteral') {
        const tagName = node.arguments[0].value;

        let start = t.stringLiteral(`<${tagName}`);

        if (node.arguments[1] && node.arguments[1].type !== 'NullLiteral') {
          start = merge(start, t.callExpression(t.identifier('__a'), [node.arguments[1]]));
        }

        start = merge(start, t.stringLiteral('>'));

        const children = node.arguments.slice(2);

        if (children.length) {
          let child = children.shift();

          while (child) {
            let convertedNode = convertNode(child);

            if (convertedNode.type === 'Identifier') {
              convertedNode = t.callExpression(t.identifier('__o'), [convertedNode]);
            }

            start = merge(start, convertedNode);

            child = children.shift();
          }
        }

        const end = t.stringLiteral(`</${tagName}>`);

        return merge(start, end);
      }

      return t.callExpression(t.identifier('__o'), node.arguments);
    } else if (node.type === 'LogicalExpression' || node.type === 'MemberExpression') {
      // TODO remember what LogicalExpression is
      // wrap MemberExpressions (eg. `this.member`) in call to `O` helper
      return t.callExpression(t.identifier('__o'), [node]);
    } else if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      // wrap CallExpressions where callee is MemberExpressions (eg
      // `this.place.map((room) => 'sucks'))`) in call to `output` helper
      return t.callExpression(t.identifier('__o'), [node]);
    }

    // simply return the node as is
    return node;
  }

  return {
    visitor: {
      CallExpression(path) {
        const node = path.node;

        if (node.type === 'CallExpression') {
          if (node.callee.name === 'h') {
            // only start conversion on h() calls, should always be root h call in here
            path.replaceWith(convertNode(node));
          } else if (
            config && config.replace &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require' &&
            node.arguments.length === 1 &&
            node.arguments[0].type === 'StringLiteral'
          ) {
            const keys = Object.keys(config.replace);

            const found = keys.find((key) => node.arguments[0].value.startsWith(key));

            if (found) {
              const pathArray = node.arguments[0].value.split('/').slice(1);
              node.arguments[0].value = config.replace[found] + (pathArray.length ? `/${pathArray.join('/')}` : '');
            }
          }
        }
      },

      Program: {
        enter(path) {
          const node = path.node;

          // insert helpers at the top of each jsx file
          node.body.unshift(
            babylon.parse('const { attributes: __a, output: __o } = require("jsx-node/helpers");\n\n').program.body[0]
          );
        },
      },
    },
  };
};
