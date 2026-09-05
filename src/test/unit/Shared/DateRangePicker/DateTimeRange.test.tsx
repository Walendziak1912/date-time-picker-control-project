import { createRef } from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import {
  DateTimeRange,
  DateTimePickerPrecision,
  FillRequired,
} from "../../../../shared/components/DateTimeRange";
import type {
  DateTimeRangeHandle,
  DateTimeRangeValue,
} from "../../../../shared/components/DateTimeRange/types";

const utc = (y: number, m: number, d: number, h = 0, min = 0, s = 0) =>
  new Date(Date.UTC(y, m, d, h, min, s));

describe("DateTimeRange", () => {
  test("Render dwóch pól start i koniec z domyślnymi etykietami Od i Do", () => {
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
  });

  test("Wyświetlenie wartości start i koniec", () => {
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("01.07.2026");
    expect(inputs[1]).toHaveValue("10.07.2026");
  });

  test("Wybór tylko daty początkowej bez uzupełnia daty końcowej", () => {
    const onChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        onChange={onChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.change(startInput, { target: { value: "05.07.2026" } });
    fireEvent.blur(startInput);

    const [nextValue, context] = onChange.mock.calls.at(-1)!;
    expect(context.source).toBe("start");
    expect((nextValue as DateTimeRangeValue).start!.toISOString()).toBe(
      "2026-07-05T00:00:00.000Z",
    );
    expect((nextValue as DateTimeRangeValue).end).toBeNull();
  });

  test("Zmiana daty początkowej daty", () => {
    const onChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        onChange={onChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.change(startInput, { target: { value: "05.07.2026" } });
    fireEvent.blur(startInput);

    expect(onChange).toHaveBeenCalled();
    const [nextValue, context] = onChange.mock.calls.at(-1)!;
    expect(context.source).toBe("start");
    expect((nextValue as DateTimeRangeValue).start!.toISOString()).toBe(
      "2026-07-05T00:00:00.000Z",
    );
  });

  test("Zmiana daty końcowej", () => {
    const onChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        onChange={onChange}
      />,
    );

    const endInput = screen.getAllByRole("textbox")[1];
    fireEvent.focus(endInput);
    fireEvent.change(endInput, { target: { value: "20.07.2026" } });
    fireEvent.blur(endInput);

    const [nextValue, context] = onChange.mock.calls.at(-1)!;
    expect(context.source).toBe("end");
    expect((nextValue as DateTimeRangeValue).end!.toISOString()).toBe(
      "2026-07-20T23:59:59.999Z",
    );
  });

  test("Wybór końcowej daty w kalendarzu przy precyzji ms domyślnie ustawia 23:59:59.999", () => {
    const onChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={[
          DateTimePickerPrecision.Date,
          DateTimePickerPrecision.DateTimeMilliseconds,
        ]}
        selectedDateTimePrecision={DateTimePickerPrecision.DateTimeMilliseconds}
        value={{ start: utc(2026, 6, 1), end: null }}
        onChange={onChange}
      />,
    );

    const endInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(
      endInput.parentElement!.querySelector("button[aria-label='Otwórz wybór daty i godziny']")!,
    );

    const day20 = screen
      .getAllByRole("gridcell")
      .find(
        (cell) =>
          cell.textContent === "20" &&
          !cell.classList.contains("dtp-day--outside"),
      );
    fireEvent.click(day20!);

    expect(endInput).toHaveValue("20.07.2026 23:59:59:999");

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    const [nextValue, context] = onChange.mock.calls.at(-1)!;
    expect(context.source).toBe("end");
    expect((nextValue as DateTimeRangeValue).end!.toISOString()).toBe(
      "2026-07-20T23:59:59.999Z",
    );
  });

  test("Niepoprawny format w polu początkowym raportuje start-date-format przez validate()", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        onValidationChange={onValidationChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.change(startInput, { target: { value: "zła data" } });

    let result;
    act(() => {
      result = ref.current!.validate();
    });

    expect(result!.valid).toBe(false);
    expect(result!.reason).toBe("start-date-format");
    expect(onValidationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ valid: false, reason: "start-date-format" }),
    );
  });

  test("Data początkowa większa niż data końcowa test walidacji przez validate()", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 20), end: utc(2026, 6, 10) }}
        onValidationChange={onValidationChange}
      />,
    );

    let result;
    act(() => {
      result = ref.current!.validate();
    });

    expect(result!.valid).toBe(false);
    expect(result!.reason).toBe("end-date-before-start-date");
    expect(onValidationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        valid: false,
        reason: "end-date-before-start-date",
      }),
    );
  });

  test("Poprawny zakres walidacja wynik valid przez validate()", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        onValidationChange={onValidationChange}
      />,
    );

    let result;
    act(() => {
      result = ref.current!.validate();
    });

    expect(result!.valid).toBe(true);
    expect(onValidationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ valid: true }),
    );
  });

  test("Brak wymaganych dat (fillRequired=All) zgłasza both-dates-required przez validate()", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        onValidationChange={onValidationChange}
        validationRules={{ "both-dates-required": "Wybierz obie daty" }}
      />,
    );

    let result;
    act(() => {
      result = ref.current!.validate();
    });

    expect(result!.valid).toBe(false);
    expect(result!.reason).toBe("both-dates-required");
    expect(result!.message).toBe("Wybierz obie daty");
    expect(onValidationChange).toHaveBeenCalledTimes(1);
    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: false,
        reason: "both-dates-required",
        message: "Wybierz obie daty",
      }),
    );

    act(() => {
      ref.current!.validate();
    });
    expect(onValidationChange).toHaveBeenCalledTimes(2);
  });

  test("Blur poza zakresem z fillRequired=All wywołuje onValidationChange z both-dates-required", async () => {
    const onValidationChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        validationMode="blur"
        onValidationChange={onValidationChange}
        validationRules={{ "both-dates-required": "Wybierz obie daty" }}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.blur(startInput, { relatedTarget: document.body });

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          reason: "both-dates-required",
          message: "Wybierz obie daty",
        }),
      );
    });
  });

  test("Blur poza zakresem z fillRequired=StartDate wywołuje onValidationChange z start-date-required", async () => {
    const onValidationChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: utc(2026, 6, 10) }}
        fillRequired={FillRequired.StartDate}
        validationMode="blur"
        onValidationChange={onValidationChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.blur(startInput, { relatedTarget: document.body });

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          reason: "start-date-required",
        }),
      );
    });
  });

  test("Przejście focusu między polami zakresu nie wywołuje onValidationChange przed opuszczeniem kontenera", async () => {
    const onValidationChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        onValidationChange={onValidationChange}
      />,
    );

    const [startInput, endInput] = screen.getAllByRole("textbox");
    fireEvent.focus(startInput);
    fireEvent.blur(startInput, { relatedTarget: endInput });
    fireEvent.focus(endInput);

    await waitFor(() => {
      expect(onValidationChange).not.toHaveBeenCalled();
    });
  });

  test("Komponent disabled wyłącza pola", () => {
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        disabled
      />,
    );

    screen
      .getAllByRole("textbox")
      .forEach((input) => expect(input).toBeDisabled());
  });

  test("Domyślny tryb submit nie wywołuje onValidationChange po blur poza zakresem", async () => {
    const onValidationChange = vi.fn();
    render(
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        onValidationChange={onValidationChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    fireEvent.focus(startInput);
    fireEvent.blur(startInput, { relatedTarget: document.body });

    await waitFor(() => {
      expect(onValidationChange).not.toHaveBeenCalled();
    });
  });

  test("Domyślny tryb submit nadal waliduje przez ref.validate()", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        onValidationChange={onValidationChange}
        validationRules={{ "both-dates-required": "Wybierz obie daty" }}
      />,
    );

    let result;
    act(() => {
      result = ref.current!.validate();
    });

    expect(result!.valid).toBe(false);
    expect(result!.reason).toBe("both-dates-required");
    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: false,
        reason: "both-dates-required",
      }),
    );
  });

  test("Po validate() uzupełnienie wymaganych dat usuwa ramkę błędu bez ponownego submit", () => {
    const onValidationChange = vi.fn();
    const ref = createRef<DateTimeRangeHandle>();
    const { rerender } = render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: null, end: null }}
        fillRequired={FillRequired.All}
        showBorderFieldWhenError
        onValidationChange={onValidationChange}
        validationRules={{ "both-dates-required": "Wybierz obie daty" }}
      />,
    );

    act(() => {
      ref.current!.validate();
    });

    const [startInput, endInput] = screen.getAllByRole("textbox");
    expect(startInput.closest(".dtp")).toHaveAttribute("data-error");
    expect(endInput.closest(".dtp")).toHaveAttribute("data-error");

    rerender(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 6, 1), end: utc(2026, 6, 10) }}
        fillRequired={FillRequired.All}
        showBorderFieldWhenError
        onValidationChange={onValidationChange}
        validationRules={{ "both-dates-required": "Wybierz obie daty" }}
      />,
    );

    expect(startInput.closest(".dtp")).not.toHaveAttribute("data-error");
    expect(endInput.closest(".dtp")).not.toHaveAttribute("data-error");
    expect(onValidationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ valid: true }),
    );
  });

  test("Po validate() brak daty końcowej podświetla tylko pole końcowe", () => {
    const ref = createRef<DateTimeRangeHandle>();
    render(
      <DateTimeRange
        ref={ref}
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={{ start: utc(2026, 8, 2), end: null }}
        fillRequired={FillRequired.All}
        showBorderFieldWhenError
        validationRules={{ "end-date-required": "Podaj datę końcową w filtrze" }}
      />,
    );

    act(() => {
      ref.current!.validate();
    });

    const [startInput, endInput] = screen.getAllByRole("textbox");
    expect(startInput.closest(".dtp")).not.toHaveAttribute("data-error");
    expect(endInput.closest(".dtp")).toHaveAttribute("data-error");
  });
});
