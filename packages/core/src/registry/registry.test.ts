import { describe, it, expect } from 'vitest';
import { FieldRegistry } from './registry';

describe('FieldRegistry', () => {
  it('should register and get a field definition', () => {
    const registry = new FieldRegistry<string>();
    const definition = { type: 'text', component: 'TextInput' };
    
    registry.register(definition);
    expect(registry.get('text')).toBe(definition);
    expect(registry.has('text')).toBe(true);
  });

  it('should register many definitions', () => {
    const registry = new FieldRegistry<string>();
    const definitions = [
      { type: 'text', component: 'TextInput' },
      { type: 'number', component: 'NumberInput' },
    ];
    
    registry.registerMany(definitions);
    expect(registry.get('text')).toBe(definitions[0]);
    expect(registry.get('number')).toBe(definitions[1]);
  });

  it('should unregister a field type', () => {
    const registry = new FieldRegistry<string>();
    registry.register({ type: 'text', component: 'TextInput' });
    
    registry.unregister('text');
    expect(registry.has('text')).toBe(false);
    expect(registry.get('text')).toBeUndefined();
  });

  it('should handle overrides correctly when enabled', () => {
    const registry = new FieldRegistry<string>({ allowOverrides: true });
    registry.register({ type: 'text', component: 'OldInput' });
    registry.register({ type: 'text', component: 'NewInput' });
    
    expect(registry.get('text')?.component).toBe('NewInput');
  });

  it('should throw error on override when disabled', () => {
    const registry = new FieldRegistry<string>({ allowOverrides: false });
    registry.register({ type: 'text', component: 'OldInput' });
    
    expect(() => {
      registry.register({ type: 'text', component: 'NewInput' });
    }).toThrow('already registered and overrides are disabled');
  });

  it('should support explicit override method', () => {
    const registry = new FieldRegistry<string>({ allowOverrides: false });
    registry.register({ type: 'text', component: 'OldInput' });
    
    registry.override('text', { type: 'text', component: 'OverrideInput' });
    expect(registry.get('text')?.component).toBe('OverrideInput');
  });

  it('should be framework agnostic with generic component type', () => {
    interface ReactComponent { render: () => string }
    const registry = new FieldRegistry<ReactComponent>();
    
    const component: ReactComponent = { render: () => '<div></div>' };
    registry.register({ type: 'custom', component });
    
    expect(registry.get('custom')?.component).toBe(component);
  });
});
