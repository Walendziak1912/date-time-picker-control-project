import { forwardRef, useImperativeHandle } from "react";
import { useDateTimePickerController } from "../hooks";
import type { DateTimePickerFieldProps, DateTimePickerHandle } from "../types";
import { DateTimePickerShell } from "./DateTimePickerShell";

export const DateTimePickerField = forwardRef<
  DateTimePickerHandle,
  DateTimePickerFieldProps
>(function DateTimePickerField(props, ref) {
  const controller = useDateTimePickerController(props, "instant");

  useImperativeHandle(
    ref,
    () => ({ validate: controller.validate, reset: controller.reset }),
    [controller.validate, controller.reset],
  );

  return (
    <DateTimePickerShell
      shellProps={props}
      controller={controller}
      testId="datetime-picker-field"
    />
  );
});
