import React, { ChangeEvent, useState } from "react";

interface DropdownProps<T> {
  items: T[];
  getLabel: (item: T) => string;
  onSelect: (index: number) => void;
  defaultIndex?: number;
}

export const Dropdown = <T,>({
  items,
  getLabel,
  onSelect,
  defaultIndex = -1,
}: DropdownProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(event.target.value, 10);
    setSelectedIndex(index);
    onSelect(index);
  };

  return (
    <div>
      <label htmlFor="dropdown">Select an Option:</label>
      <select
        name="dropdown"
        id="dropdown"
        value={selectedIndex}
        onChange={handleChange}
      >
        <option value="-1" disabled>
          Select an option
        </option>
        {items.map((item, i) => (
          <option key={i} value={i}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
};
