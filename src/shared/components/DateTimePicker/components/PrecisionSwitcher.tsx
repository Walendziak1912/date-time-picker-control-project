import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import {
  getDefaultPrecisionLabel,
  type DateTimePickerPrecisionValue,
} from "../types/precision.types";
import type { SupportedLocale } from "../types/locale.types";

type PrecisionSwitcherProps = {
  options: DateTimePickerPrecisionValue[];
  value: DateTimePickerPrecisionValue;
  onChange: (precision: DateTimePickerPrecisionValue) => void;
  locale: SupportedLocale;
  precisionLabels?: Partial<Record<DateTimePickerPrecisionValue, string>>;
  disabled?: boolean;
};

type PrecisionOption = {
  label: string;
  value: DateTimePickerPrecisionValue;
};

function resolveLabel(
  precision: DateTimePickerPrecisionValue,
  locale: SupportedLocale,
  precisionLabels?: Partial<Record<DateTimePickerPrecisionValue, string>>,
): string {
  return precisionLabels?.[precision] ?? getDefaultPrecisionLabel(precision, locale);
}

export function PrecisionSwitcher({
  options,
  value,
  onChange,
  locale,
  precisionLabels,
  disabled = false,
}: PrecisionSwitcherProps) {
  if (options.length <= 1) return null;

  if (options.length === 2) {
    const [first, second] = options;
    const checked = value === second;

    return (
      <div className="dtp-precision-switch">
        <span
          className={[
            "dtp-precision-switch-label",
            !checked ? "dtp-precision-switch-label--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {resolveLabel(first, locale, precisionLabels)}
        </span>
        <InputSwitch
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.value ? second : first)}
        />
        <span
          className={[
            "dtp-precision-switch-label",
            checked ? "dtp-precision-switch-label--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {resolveLabel(second, locale, precisionLabels)}
        </span>
      </div>
    );
  }

  const dropdownOptions: PrecisionOption[] = options.map((option) => ({
    label: resolveLabel(option, locale, precisionLabels),
    value: option,
  }));

  return (
    <div className="dtp-precision-dropdown" onMouseDown={(event) => event.stopPropagation()}>
      <Dropdown
        value={value}
        options={dropdownOptions}
        optionLabel="label"
        optionValue="value"
        disabled={disabled}
        appendTo="self"
        panelClassName="dtp-precision-dropdown-panel"
        className="dtp-precision-dropdown-control"
        onChange={(event) => {
          if (event.value != null) onChange(event.value);
        }}
      />
    </div>
  );
}
