import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CityTabs } from '@/components/dashboard/city-tabs';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

describe('Switch Component', () => {
  it('renders with unchecked state by default', () => {
    render(<Switch aria-label="Test Switch" />);
    const switchEl = screen.getByRole('switch', { name: 'Test Switch' });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');
  });

  it('renders checked state correctly', () => {
    render(<Switch aria-label="Test Switch" checked={true} />);
    const switchEl = screen.getByRole('switch', { name: 'Test Switch' });
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
    expect(switchEl).toHaveAttribute('data-state', 'checked');
  });

  it('triggers onCheckedChange callback when clicked', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch aria-label="Test Switch" checked={false} onCheckedChange={handleCheckedChange} />);
    const switchEl = screen.getByRole('switch', { name: 'Test Switch' });

    fireEvent.click(switchEl);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('handles spacebar and enter keyboard navigation', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch aria-label="Test Switch" checked={false} onCheckedChange={handleCheckedChange} />);
    const switchEl = screen.getByRole('switch', { name: 'Test Switch' });

    fireEvent.keyDown(switchEl, { key: ' ' });
    expect(handleCheckedChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(switchEl, { key: 'Enter' });
    expect(handleCheckedChange).toHaveBeenCalledTimes(2);
  });

  it('does not trigger onCheckedChange when disabled', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch aria-label="Test Switch" disabled={true} onCheckedChange={handleCheckedChange} />);
    const switchEl = screen.getByRole('switch', { name: 'Test Switch' });

    fireEvent.click(switchEl);
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });
});

describe('CityTabs Component', () => {
  const cities = ['Delhi', 'Mumbai', 'Bengaluru'];

  it('renders all city options with tablist semantics', () => {
    render(<CityTabs cities={cities} selectedCity="Delhi" />);
    const tablist = screen.getByRole('tablist', { name: 'Monitored cities' });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('Delhi');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });
});

describe('RadioGroup Component', () => {
  it('renders radio options with dot indicator semantics', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup defaultValue="slate" onValueChange={handleChange}>
        <RadioGroupItem value="indigo">Indigo Blue</RadioGroupItem>
        <RadioGroupItem value="taupe">Taupe Brown</RadioGroupItem>
        <RadioGroupItem value="slate">Slate Gray</RadioGroupItem>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const firstRadio = radios[0];
    const thirdRadio = radios[2];
    expect(firstRadio).toBeDefined();
    expect(thirdRadio).toBeDefined();
    if (firstRadio && thirdRadio) {
      expect(thirdRadio).toHaveAttribute('aria-checked', 'true');
      expect(firstRadio).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(firstRadio);
      expect(handleChange).toHaveBeenCalledWith('indigo');
    }
  });
});
