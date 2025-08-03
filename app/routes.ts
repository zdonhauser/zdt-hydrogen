import { flatRoutes } from '@react-router/fs-routes';
import { layout, type RouteConfig } from '@react-router/dev/routes';
import {hydrogenRoutes} from '@shopify/hydrogen';

export default hydrogenRoutes([
  layout('./layout.tsx', await flatRoutes()),
]) satisfies RouteConfig;
