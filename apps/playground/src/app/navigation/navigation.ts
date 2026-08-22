import { routeDefinitions } from '../routes/routeDefinitions';

export const navigationGroups = ['Start', 'Core concepts', 'Enterprise', 'Quality'].map((group) => ({
  group,
  items: routeDefinitions.filter((route) => route.group === group),
})).filter(({ items }) => items.length > 0);
