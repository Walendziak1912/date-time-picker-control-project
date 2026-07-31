import { Button } from "primereact/button";
import { useRef } from "react";
import { AnalogClock } from "./AnalogClock";
import { Calendar } from "./Calendar";
import { CalendarIcon } from "./CalendarIcon";
import { DigitalClock } from "./DigitalClock";
import {
  useDateTimePickerController,
  usePopoverDismiss,
  usePopoverPlacement,
} from "../hooks";
import type { DateTimePickerProps, DateTimePickerView } from "../types";
import "./DateTimePicker.css";

export function DateTimePicker(props: DateTimePickerProps) {
  const {
    label,
    name,
    className,
    showDaysOutsideCurrentMonth = false,
    disableHighlightToday = false,
    yearsOrder = "asc",
    yearsPerRow = 4,
    monthsPerRow = 3,
    timeVariant = "analog",
    showTextUnderFieldWhenError = false,
    showBorderFieldWhenError = false,
    closeOnSelect = false,
    onViewChange,
    onYearChange,
  } = props;

  const controller = useDateTimePickerController(props);
  const {
    rootRef,
    inputRef,
    labelId,
    value,
    open,
    draft,
    month,
    inputText,
    inputValue,
    inputSize,
    hasError,
    fieldErrorMessage,
    text,
    format,
    mode,
    timezone,
    ampm,
    disabled,
    readOnly,
    resolvedShowSeconds,
    resolvedShowMilliseconds,
    calendarViews,
    showCalendar,
    showTime,
    hourStep,
    minuteStep,
    secondStep,
    millisecondStep,
    calendarOpenTo,
    dateConstraints,
    timeConstraints,
    isTodayDisabled,
    handleDismiss,
    handleCancel,
    handleOpen,
    handleSelectDay,
    handleToday,
    handleTimeChange,
    handleOk,
    handleClear,
    handleMonthChange,
    onFieldChange,
    onFieldBlur,
    onFieldKeyDown,
    onFieldFocus,
    onPopoverMouseDown,
  } = controller;

  const popoverRef = useRef<HTMLDivElement>(null);

  usePopoverDismiss(open, rootRef, handleDismiss);
  const popoverPlacement = usePopoverPlacement(open, rootRef, popoverRef);

  return (
    <div
      ref={rootRef}
      className={["dtp", className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-open={open || undefined}
      data-error={(showBorderFieldWhenError && hasError) || undefined}
      data-mode={mode}
      data-seconds={resolvedShowSeconds && mode !== "date" ? true : undefined}
      data-milliseconds={
        resolvedShowMilliseconds && mode !== "date" ? true : undefined
      }
    >
      {label != null && (
        <label className="dtp-label" id={labelId} htmlFor={`${labelId}-input`}>
          {label}
        </label>
      )}

      <div className="dtp-field">
        <input
          ref={inputRef}
          id={`${labelId}-input`}
          className="dtp-input"
          name={name}
          size={inputSize}
          value={inputValue}
          readOnly={readOnly}
          disabled={disabled}
          aria-labelledby={label != null ? labelId : undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={hasError || undefined}
          onFocus={onFieldFocus}
          onBlur={onFieldBlur}
          onChange={onFieldChange}
          onKeyDown={onFieldKeyDown}
          placeholder={format}
        />
        {!disabled && !readOnly && (
          <button
            type="button"
            className={[
              "dtp-clear",
              value || inputText ? "" : "dtp-clear--hidden",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={text.clear}
            aria-hidden={value || inputText ? undefined : true}
            tabIndex={value || inputText ? undefined : -1}
            onClick={handleClear}
          >
            ×
          </button>
        )}
        <button
          type="button"
          className="dtp-open"
          aria-label={text.openPicker}
          disabled={disabled || readOnly}
          onClick={handleOpen}
        >
          <CalendarIcon />
        </button>
      </div>
      {showTextUnderFieldWhenError && hasError && fieldErrorMessage != null && (
        <div className="dtp-field-error" role="alert">
          {fieldErrorMessage}
        </div>
      )}

      {open && (
        <div
          ref={popoverRef}
          className="dtp-popover"
          role="dialog"
          aria-modal="false"
          aria-label={text.dialog}
          data-placement={popoverPlacement}
          onMouseDown={onPopoverMouseDown}
        >
          <div
            className={[
              "dtp-views",
              showCalendar && !showTime ? "dtp-views--date-only" : "",
              !showCalendar && showTime ? "dtp-views--time-only" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {showCalendar && (
              <Calendar
                month={month}
                value={draft}
                locale={props.locale ?? "pl-PL"}
                timezone={timezone}
                text={text}
                showDaysOutsideCurrentMonth={showDaysOutsideCurrentMonth}
                disableHighlightToday={disableHighlightToday}
                enabledViews={calendarViews}
                openTo={calendarOpenTo}
                yearsOrder={yearsOrder}
                yearsPerRow={yearsPerRow}
                monthsPerRow={monthsPerRow}
                dateConstraints={dateConstraints}
                onMonthChange={handleMonthChange}
                onSelectDay={handleSelectDay}
                onViewChange={(v) => onViewChange?.(v as DateTimePickerView)}
                onYearChange={onYearChange}
              />
            )}
            {showTime && timeVariant === "digital" && (
              <DigitalClock
                value={draft}
                timezone={timezone}
                ampm={ampm}
                showSeconds={resolvedShowSeconds}
                showMilliseconds={resolvedShowMilliseconds}
                hourStep={hourStep}
                minuteStep={minuteStep}
                secondStep={secondStep}
                millisecondStep={millisecondStep}
                timeConstraints={timeConstraints}
                onChange={handleTimeChange}
                text={text}
              />
            )}
            {showTime && timeVariant === "analog" && (
              <AnalogClock
                value={draft}
                timezone={timezone}
                ampm={ampm}
                showSeconds={resolvedShowSeconds}
                showMilliseconds={resolvedShowMilliseconds}
                minuteStep={minuteStep}
                secondStep={secondStep}
                millisecondStep={millisecondStep}
                timeConstraints={timeConstraints}
                onChange={handleTimeChange}
                text={text}
              />
            )}
          </div>
          {!closeOnSelect && (
            <div className="dtp-actions">
              {showCalendar && (
                <Button
                  type="button"
                  className="dtp-today-btn"
                  label={text.today}
                  text
                  disabled={isTodayDisabled}
                  onClick={handleToday}
                />
              )}
              <div className="dtp-actions-end">
                <Button
                  type="button"
                  label={text.cancel}
                  outlined
                  severity="secondary"
                  onClick={handleCancel}
                />
                <Button type="button" label={text.ok} onClick={handleOk} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
