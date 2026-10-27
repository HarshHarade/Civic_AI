import React from 'react';
import {
  Construction,
  Trash2,
  Droplets,
  Waves,
  LightbulbOff,
  Footprints,
  TrafficCone,
  AlertOctagon,
  CloudRain,
  Sparkles,
  TreePine,
  Flower2,
  PawPrint,
  Volume2,
  HelpCircle,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const iconProps = { size: 20, ...props };
  const lower = name.toLowerCase();

  if (lower.includes('road') || lower.includes('pothole') || lower.includes('construction')) {
    return <Construction {...iconProps} />;
  }
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('bin') || lower.includes('waste')) {
    return <Trash2 {...iconProps} />;
  }
  if (lower.includes('water leakage') || lower.includes('water supply') || lower.includes('droplet')) {
    return <Droplets {...iconProps} />;
  }
  if (lower.includes('drainage') || lower.includes('sewage') || lower.includes('waves')) {
    return <Waves {...iconProps} />;
  }
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('electric')) {
    return <LightbulbOff {...iconProps} />;
  }
  if (lower.includes('footpath') || lower.includes('pavement') || lower.includes('footprints')) {
    return <Footprints {...iconProps} />;
  }
  if (lower.includes('traffic') || lower.includes('signal') || lower.includes('sign')) {
    return <TrafficCone {...iconProps} />;
  }
  if (lower.includes('dumping') || lower.includes('cleanliness') || lower.includes('debris')) {
    return <AlertOctagon {...iconProps} />;
  }
  if (lower.includes('flood') || lower.includes('waterlogging') || lower.includes('rain')) {
    return <CloudRain {...iconProps} />;
  }
  if (lower.includes('toilet') || lower.includes('sanitation') || lower.includes('urinal')) {
    return <Sparkles {...iconProps} />;
  }
  if (lower.includes('tree') || lower.includes('branch') || lower.includes('fallen')) {
    return <TreePine {...iconProps} />;
  }
  if (lower.includes('park') || lower.includes('garden') || lower.includes('flower')) {
    return <Flower2 {...iconProps} />;
  }
  if (lower.includes('stray') || lower.includes('animal') || lower.includes('dog')) {
    return <PawPrint {...iconProps} />;
  }
  if (lower.includes('noise') || lower.includes('nuisance') || lower.includes('volume')) {
    return <Volume2 {...iconProps} />;
  }

  return <HelpCircle {...iconProps} />;
};
