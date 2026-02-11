import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// Mock Link component since it's used in Footer
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('Footer Component', () => {
  it('renders platform links', () => {
    render(<Footer />);
    
    expect(screen.getByText('BongoDB')).toBeDefined();
    expect(screen.getByText('All Courses')).toBeDefined();
    expect(screen.getByText('Privacy Policy')).toBeDefined();
  });

  it('renders current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText((content) => content.includes(year))).toBeDefined();
  });
});
