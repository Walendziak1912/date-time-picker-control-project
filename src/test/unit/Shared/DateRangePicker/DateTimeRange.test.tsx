import React, { createRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

const utc = (y: number, m: number, d: number, h = 0, min = 0, s = 0) => new Date(Date.UTC(y, m, d, h, min, s));

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
        expect((nextValue as DateTimeRangeValue).start!.toISOString()).toBe("2026-07-05T00:00:00.000Z");
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
        expect((nextValue as DateTimeRangeValue).end!.toISOString()).toBe("2026-07-20T00:00:00.000Z");
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
        fireEvent.blur(startInput);

        const result = ref.current!.validate();
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("start-date-format");
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

        const result = ref.current!.validate();
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("end-date-before-start-date");
        expect(onValidationChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ valid: false, reason: "end-date-before-start-date" }),
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

        const result = ref.current!.validate();
        expect(result.valid).toBe(true);
        expect(onValidationChange).toHaveBeenLastCalledWith(expect.objectContaining({ valid: true }));
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

        const result = ref.current!.validate();
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("both-dates-required");
        expect(result.message).toBe("Wybierz obie daty");
        expect(onValidationChange).toHaveBeenCalledTimes(1);
        expect(onValidationChange).toHaveBeenCalledWith(
            expect.objectContaining({
                valid: false,
                reason: "both-dates-required",
                message: "Wybierz obie daty",
            }),
        );

        ref.current!.validate();
        expect(onValidationChange).toHaveBeenCalledTimes(2);
    });

    test("Blur poza zakresem z fillRequired=All wywołuje onValidationChange z both-dates-required", async () => {
        const onValidationChange = vi.fn();
        render(
            <DateTimeRange
                dateTimePrecisions={DateTimePickerPrecision.Date}
                value={{ start: null, end: null }}
                fillRequired={FillRequired.All}
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

        screen.getAllByRole("textbox").forEach((input) => expect(input).toBeDisabled());
    });
});
