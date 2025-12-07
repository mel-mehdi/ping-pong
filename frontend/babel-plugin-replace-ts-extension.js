module.exports = function() {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source;
        if (source && source.value) {
          source.value = source.value.replace(/\.ts$/, '.js');
        }
      },
      ExportNamedDeclaration(path) {
        const source = path.node.source;
        if (source && source.value) {
          source.value = source.value.replace(/\.ts$/, '.js');
        }
      },
      ExportAllDeclaration(path) {
        const source = path.node.source;
        if (source && source.value) {
          source.value = source.value.replace(/\.ts$/, '.js');
        }
      }
    }
  };
};