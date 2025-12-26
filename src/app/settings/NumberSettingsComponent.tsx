import './NumberSettingsComponent.css';
import { Setting } from './Setting';

export const NumberSettingsComponent = ({
  setting,
  onChange,
}: {
  setting: Setting<number>;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="number-setting">
      <label htmlFor={setting.id}>
        {setting.name}: {setting.value}
      </label>
      <input
        id={setting.id}
        type="range"
        value={setting.value}
        onChange={e => onChange(+e.target.value)}
        min={setting.params?.min}
        max={setting.params?.max}
        step={setting.params?.step}
      />
    </div>
  );
};
