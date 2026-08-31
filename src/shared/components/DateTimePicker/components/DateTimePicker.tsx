import { forwardRef, useImperativeHandle } from "react";
import { useDateTimePickerController } from "../hooks";
import type { DateTimePickerHandle, DateTimePickerProps } from "../types";
import { DateTimePickerShell } from "./DateTimePickerShell";

export const DateTimePicker = forwardRef<DateTimePickerHandle, DateTimePickerProps>(
  function DateTimePicker(props, ref) {
    const controller = useDateTimePickerController(props, "bounds");

    useImperativeHandle(
      ref,
      () => ({ validate: controller.validate, reset: controller.reset }),
      [controller.validate, controller.reset],
    );

    return (
      <DateTimePickerShell
        shellProps={props}
        controller={controller}
        testId="datetime-picker"
      />
    );
  },
);
