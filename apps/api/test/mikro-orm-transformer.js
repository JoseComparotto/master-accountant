const tsJest = require('ts-jest');

// Proteção Interop: Tenta buscar o createTransformer direto ou de dentro do .default
const createTransformer = tsJest.createTransformer || (tsJest.default && tsJest.default.createTransformer);

if (!createTransformer) {
  throw new Error(
    'Não foi possível encontrar a função "createTransformer" no pacote ts-jest. ' +
    'Certifique-se de que o ts-jest está instalado corretamente.'
  );
}

// Inicializa o transformador oficial aplicando as suas configurações do tsconfig
const tsJestTransformer = createTransformer({
  tsconfig: {
    module: 'commonjs',
    moduleResolution: 'node',
    resolvePackageJsonExports: false,
    allowJs: true
  }
});

module.exports = {
  process(sourceText, sourcePath, options) {
    // Se o arquivo pertencer ao ecossistema MikroORM, faz o hot-fix de ESM para CommonJS
    if (sourcePath.includes('@mikro-orm')) {
      sourceText = sourceText.replace(/import\.meta\.resolve/g, 'require.resolve');
    }
    
    // Repassa o código (modificado ou não) para o fluxo normal do ts-jest
    return tsJestTransformer.process(sourceText, sourcePath, options);
  }
};