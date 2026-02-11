import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('renders title and value correctly', () => {
    render(<Card title="Total Users" value="1,234" />);
    
    expect(screen.getByText('Total Users')).toBeDefined();
    expect(screen.getByText('1,234')).toBeDefined();
  });
});
