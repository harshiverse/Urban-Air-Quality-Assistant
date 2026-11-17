import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AqiDisplay,
  AqiScaleBar,
  PollutantCard,
  DataFreshnessBadge,
  MeasurementStatusIndicator,
  DataSourceAttribution,
} from '@/components/air-quality';

describe('Air Quality Components', () => {
  describe('AqiDisplay', () => {
    it('renders numerical AQI value and category label', () => {
      render(<AqiDisplay value={75} category="SATISFACTORY" size="md" />);
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Satisfactory')).toBeInTheDocument();
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Air Quality Index: 75, Satisfactory');
    });

    it('renders "N/A" and "Unknown" when value is null', () => {
      render(<AqiDisplay value={null} category={null} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Air Quality Index: unavailable');
    });
  });

  describe('AqiScaleBar', () => {
    it('renders all 6 CPCB categories', () => {
      render(<AqiScaleBar currentValue={150} />);
      const scaleBar = screen.getByRole('img');
      expect(scaleBar).toHaveAttribute('aria-label', expect.stringContaining('Current value: 150'));
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Satisfactory')).toBeInTheDocument();
      expect(screen.getByText('Moderately Polluted')).toBeInTheDocument();
      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('Very Poor')).toBeInTheDocument();
      expect(screen.getByText('Severe')).toBeInTheDocument();
    });
  });

  describe('PollutantCard', () => {
    it('renders pollutant name, concentration, unit and sub-index', () => {
      render(
        <PollutantCard
          name="PM2.5"
          concentration={45.2}
          unit="µg/m³"
          subIndex={75}
          category="SATISFACTORY"
          averagingPeriod="24-hour"
        />
      );
      expect(screen.getByText('PM2.5')).toBeInTheDocument();
      expect(screen.getByText('45.2')).toBeInTheDocument();
      expect(screen.getByText('µg/m³')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Satisfactory')).toBeInTheDocument();
      expect(screen.getByText('24-hour avg')).toBeInTheDocument();
    });

    it('handles unavailable concentration and sub-index gracefully', () => {
      render(
        <PollutantCard
          name="O₃"
          concentration={null}
          unit="µg/m³"
          subIndex={null}
          category={null}
        />
      );
      expect(screen.getByText('O₃')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.getByText('Sub-index: N/A')).toBeInTheDocument();
    });
  });

  describe('DataFreshnessBadge', () => {
    it('renders with appropriate label', () => {
      const now = new Date();
      render(<DataFreshnessBadge observedAt={now} />);
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('renders Unknown when observedAt is null', () => {
      render(<DataFreshnessBadge observedAt={null} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('MeasurementStatusIndicator', () => {
    it('renders label and description with proper icon', () => {
      render(<MeasurementStatusIndicator status="live" />);
      expect(screen.getByText('Live')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Data status: Live — Real-time observation data'
      );
    });
  });

  describe('DataSourceAttribution', () => {
    it('renders source and station info', () => {
      render(
        <DataSourceAttribution
          source="CPCB"
          stationName="ITO"
          stationId="DL001"
        />
      );
      expect(
        screen.getByText('Source: CPCB • Station: ITO (DL001)')
      ).toBeInTheDocument();
    });
  });
});
