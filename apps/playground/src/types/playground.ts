export type PlaygroundRouteStatus = 'available' | 'scaffolded' | 'planned';
export type PlaygroundDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface PlaygroundRouteDefinition {
  id: string;
  path: `/${string}` | '/';
  title: string;
  group: 'Start' | 'Core concepts' | 'Enterprise' | 'Quality';
  status: PlaygroundRouteStatus;
  priority: 'P0' | 'P1' | 'P2';
  description: string;
}

export interface DemoMetadata {
  title: string;
  purpose: string;
  difficulty: PlaygroundDifficulty;
  packages: readonly string[];
  expectedBehavior: readonly string[];
}
