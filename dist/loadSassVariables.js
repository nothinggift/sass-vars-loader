'use strict';

var fs = require('fs');
var path = require('path');
var sass = require('node-sass');

var varReg = /\$([\w-]+)/g;
//const importReg = /\@import\s+['"]([^'"]+)['"];/g
var cssReg = /load-sass-variables{([^}]+)}$/;

function match(reg, string, index) {
  if (!index) {
    index = 0;
  }
  var matchs = [];
  var match;
  while ((match = reg.exec(string)) !== null) {
    if (matchs.indexOf(match[index]) === -1) {
      matchs.push(match[index]);
    }
  }
  return matchs;
}
module.exports = function (filePath) {
  var variables = {};
  var content = fs.readFileSync(filePath).toString();
  var matchs = match(varReg, content, 1);

  var variablesCss = matchs.map(function (variable) {
    return variable + ': $' + variable + ';';
  }).join('');
  variablesCss = 'load-sass-variables{' + variablesCss + '}';

  content += variablesCss;

  var imports = [path.dirname(filePath)];

  var result = sass.renderSync({
    data: content,
    includePaths: imports,
    outputStyle: 'compact'
  });
  var cssString = result.css.toString();
  cssString = cssString.replace(/\s/g, '');
  var cssMatchs = cssString.match(cssReg);
  if (cssMatchs === null) {
    return {};
  }

  var cssArray = cssMatchs[1].split(';');
  cssArray.pop();
  cssArray.forEach(function (item) {
    var items = item.split(':');
    variables[items[0]] = items[1];
  });
  return variables;
};