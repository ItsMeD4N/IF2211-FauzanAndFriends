import { lazyLoad } from 'utils/loadable';

export const LCAPage = lazyLoad(
  () => import('./index'),
  module => module.LCAPage,
);
