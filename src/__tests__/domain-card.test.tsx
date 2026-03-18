import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DomainCard from '../components/domain-card';
import type { Domain } from '../types/domain';

const mockDomain: Domain = {
  code: 'NS',
  name: 'Network Security',
  description: 'Controls covering network security fundamentals.',
  complianceScore: 65,
};

describe('DomainCard', () => {
  it('renders domain code, name, and score', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={65} assessed={2} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('NS')).toBeDefined();
    expect(screen.getByText('Network Security')).toBeDefined();
    expect(screen.getByText('65%')).toBeDefined();
  });

  it('renders description text', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={65} assessed={2} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Controls covering network security fundamentals.')).toBeDefined();
  });

  it('shows "Moderate" label for score between 60-79', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={65} assessed={2} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Moderate')).toBeDefined();
  });

  it('shows "Good" label for score >= 80', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={90} assessed={3} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Good')).toBeDefined();
  });

  it('shows "Needs Attention" label for score < 60', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={40} assessed={1} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Needs Attention')).toBeDefined();
  });

  it('links to the correct domain detail page', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={65} assessed={2} total={4} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/domain/NS');
  });

  it('shows assessed count', () => {
    render(
      <MemoryRouter>
        <DomainCard domain={mockDomain} complianceScore={65} assessed={2} total={4} />
      </MemoryRouter>,
    );

    expect(screen.getByText('2/4 assessed')).toBeDefined();
  });
});
