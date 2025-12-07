module.exports = function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source;
        if (source && source.value && source.value.endsWith('.ts')) {
          path.node.source = t.stringLiteral(source.value.replace(/\.ts$/, '.js'));
        }
      },
      ExportNamedDeclaration(path) {
        const source = path.node.source;
        if (source && source.value && source.value.endsWith('.ts')) {
          path.node.source = t.stringLiteral(source.value.replace(/\.ts$/, '.js'));
        }
      },
      ExportAllDeclaration(path) {
        const source = path.node.source;
        if (source && source.value && source.value.endsWith('.ts')) {
          path.node.source = t.stringLiteral(source.value.replace(/\.ts$/, '.js'));
        }
      }
    }
  };
};