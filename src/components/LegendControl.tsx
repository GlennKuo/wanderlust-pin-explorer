import React from 'react';
import L from 'leaflet';
import { X } from 'lucide-react';

interface LegendControlProps {
  locationName: string;
  onClose: () => void;
}

export class LegendControl extends L.Control {
  private container: HTMLDivElement;
  private props: LegendControlProps;
  private clickHandler: (e: Event) => void;

  constructor(props: LegendControlProps, options?: L.ControlOptions) {
    super({
      position: 'bottomleft',
      ...options
    });
    this.props = props;
    this.container = L.DomUtil.create('div');
    this.clickHandler = (e: Event) => {
      L.DomEvent.stopPropagation(e);
      this.props.onClose();
    };
  }

  onAdd(map: L.Map): HTMLElement {
    // Create the legend container with proper styling
    this.container.className = 'leaflet-legend-control';
    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2 min-w-[160px] pointer-events-auto">
        <span class="text-lg">📍</span>
        <span class="text-sm font-medium text-gray-800 flex-1">${this.props.locationName}</span>
        <button class="legend-close-btn text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100" title="Close legend">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    // Add click handler for close button
    const closeBtn = this.container.querySelector('.legend-close-btn') as HTMLElement;
    if (closeBtn) {
      L.DomEvent.on(closeBtn, 'click', this.clickHandler);
    }

    // Prevent map interactions when clicking on the legend
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.disableScrollPropagation(this.container);

    return this.container;
  }

  onRemove(map: L.Map): void {
    // Clean up event listeners
    const closeBtn = this.container.querySelector('.legend-close-btn') as HTMLElement;
    if (closeBtn) {
      L.DomEvent.off(closeBtn, 'click', this.clickHandler);
    }
  }

  // Method to update the location name
  updateLocation(locationName: string): void {
    this.props.locationName = locationName;
    const textElement = this.container.querySelector('.text-sm');
    if (textElement) {
      textElement.textContent = locationName;
    }
  }
}

// React component wrapper for easier integration
interface LegendControlComponentProps {
  map: L.Map | null;
  locationName: string;
  onClose: () => void;
  show: boolean;
}

export const LegendControlComponent: React.FC<LegendControlComponentProps> = ({
  map,
  locationName,
  onClose,
  show
}) => {
  const controlRef = React.useRef<LegendControl | null>(null);

  React.useEffect(() => {
    if (!map) return;

    if (show && !controlRef.current) {
      // Create and add the control
      controlRef.current = new LegendControl({ locationName, onClose });
      map.addControl(controlRef.current);
    } else if (!show && controlRef.current) {
      // Remove the control
      map.removeControl(controlRef.current);
      controlRef.current = null;
    } else if (show && controlRef.current) {
      // Update the location name if control exists
      controlRef.current.updateLocation(locationName);
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, locationName, onClose, show]);

  return null; // This component doesn't render anything directly
};