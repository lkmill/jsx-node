'use strict';

// copied from preact/src/dom/index.js 20161103
function hashToClassName(c) {
  let str = '';

  // eslint-disable-next-line
  for (let prop in c) {
    if (c[prop]) {
      if (str) str += ' ';

      str += prop;
    }
  }

  return str;
}

/*
 * Outputs objs into key="value" string
 */
module.exports = function attributes(obj) {
  if (!obj) return '';

  let str = '';

  Object.keys(obj).forEach((key) => {
    let value = obj[key];

    if (value && !(value instanceof Function)) {
      if (key === 'className') key = 'class';

      if (key === 'class') {
        if (Array.isArray(value)) {
          value = value.filter((value) => value).join(' ');
        } else if (typeof value === 'object') {
          value = hashToClassName(value);
        }
      }

      str += ` ${key}="${value}"`;
    }
  });

  return str;
};
