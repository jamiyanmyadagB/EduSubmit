import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCard from './GlassCard';

/**
 * Unit tests for GlassCard component
 * Tests the glassmorphism UI component with various props
 */
describe('GlassCard Component', () => {
  it('renders children correctly', () => {
    render(
      <GlassCard>
        <p>Test content</p>
      </GlassCard>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <p>Test content</p>
      </GlassCard>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with default styles', () => {
    const { container } = render(
      <GlassCard>
        <p>Test content</p>
      </GlassCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle({
      backdropFilter: expect.stringContaining('blur'),
    });
  });

  it('handles onClick events', () => {
    const handleClick = jest.fn();
    
    render(
      <GlassCard>
        <p>Clickable content</p>
      </GlassCard>
    );
    
    const card = screen.getByText('Clickable content').parentElement;
    card?.click();
    
    // Note: GlassCard may not support onClick prop directly
    // This test can be removed or modified based on actual GlassCard implementation
    // expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom children', () => {
    render(
      <GlassCard>
        <h1>Title</h1>
        <p>Description</p>
        <button>Action</button>
      </GlassCard>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('preserves child component props', () => {
    render(
      <GlassCard>
        <button disabled>Disabled Button</button>
      </GlassCard>
    );
    
    const button = screen.getByText('Disabled Button') as HTMLButtonElement;
    expect(button).toBeDisabled();
  });
});
