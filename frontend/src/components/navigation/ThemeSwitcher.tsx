import type { ThemePreference } from '../../types/articles';

interface ThemeSwitcherProps {
  value: ThemePreference;
  resolvedValue: 'light' | 'dark';
  onChange: (value: ThemePreference) => void;
}

const options: Array<{ label: string; value: ThemePreference }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function ThemeSwitcher({ value, resolvedValue, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher-wrap">
      <div className="theme-switcher" role="group" aria-label="Theme selector">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? 'is-active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="theme-note">{value === 'system' ? `System is currently ${resolvedValue}.` : `Theme locked to ${value}.`}</p>
    </div>
  );
}