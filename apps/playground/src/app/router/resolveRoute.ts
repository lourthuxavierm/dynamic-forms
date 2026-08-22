import { routeDefinitions } from '../routes/routeDefinitions';

export function normalizeRoutePath(pathname: string): string {
  const normalized = `/${pathname}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/';
}

export function resolveRoute(pathname: string) {
  const path = normalizeRoutePath(pathname);
  return routeDefinitions.find((route) => route.path === path);
}
