import kebabCase from 'utils/strings.js';

export default async ({ Vue }) => {
  const ComponentContext = require.context('components/', true, /\.vue$/i, 'lazy');

  ComponentContext.keys().forEach(componentFilePath => {
    const componentName = kebabCase(
      componentFilePath
        .split('/')
        .pop()
        .split('.')[0]
    );
    Vue.component(componentName, () => ComponentContext(componentFilePath));
  });
};
