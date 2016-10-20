'use strict';

/*
 * Outputs objs into key="value" string
 */
module.exports = function attributes(obj) {
  if (!obj) return '';

  let str = '';

  Object.keys(obj).forEach((key) => {
    if (obj[key] && !(obj[key] instanceof Function)) {
      str += ` ${key}="${obj[key]}"`;
    }
  });

  return str;
};
