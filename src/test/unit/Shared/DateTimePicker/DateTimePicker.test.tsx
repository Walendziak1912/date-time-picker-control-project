import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import {
    DateTimePicker,
    DateTimePickerPrecision,
    FillRequired,
    type DateTimePickerHandle,
} from "../../../../shared/components/DateTimePicker";

//testy na UTC by uniezależnić od maszyny
describe("DateTimePicker", () => {
    test("Render pola tekstowe z placeholderem odpowiadającym precyzji Date dd.MM.yyyy", () => {
        render(<DateTimePicker dateTimePrecisions={DateTimePickerPrecision.Date} />);
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("placeholder", "dd.MM.yyyy");
    });

    test("Dla precyzji TimeSeconds placeholder HH:mm:ss", () => {
        render(<DateTimePicker dateTimePrecisions={DateTimePickerPrecision.TimeSeconds} />);
        expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "HH:mm:ss");
    });

    test("Wyświetla sformatowaną wartość kontrolowaną (UTC)", () => {
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                value={new Date(Date.UTC(2026, 6, 29))}
            />,
        );
        expect(screen.getByRole("textbox")).toHaveValue("29.07.2026");
    });

    test("Wpisanie poprawnej daty i blur wywołuje onChange z instantem", () => {
        const onChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                onChange={onChange}
            />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "15.03.2025" } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalled();
        const [value] = onChange.mock.calls.at(-1)!;
        expect(value).toBeInstanceOf(Date);
        expect((value as Date).toISOString()).toBe("2025-03-15T00:00:00.000Z");
    });

    test("Wpisanie niepoprawnego formatu zgłasza błąd walidacji z kodem date-format", () => {
        const onValidationChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                onValidationChange={onValidationChange}
            />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "to nie data" } });
        fireEvent.blur(input);

        expect(onValidationChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                valid: false,
                reason: "date-format",
                message: expect.any(String),
            }),
        );
    });

    test("Nadpisanie komunikatu walidacji przez validationRules dla date-format", () => {
        const onValidationChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                onValidationChange={onValidationChange}
                validationRules={{ "date-format": "Wpisz poprawną datę dd.MM.yyyy" }}
            />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "zła data" } });
        fireEvent.blur(input);

        expect(onValidationChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                valid: false,
                reason: "date-format",
                message: "Wpisz poprawną datę dd.MM.yyyy",
            }),
        );
    });

    test("Wyczyszczenie pustego pola tekstem raportuje poprawną walidację", () => {
        const onChange = vi.fn();
        const onValidationChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                defaultValue={new Date(Date.UTC(2025, 0, 1))}
                onChange={onChange}
                onValidationChange={onValidationChange}
            />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);

        const [value] = onChange.mock.calls.at(-1)!;
        expect(value).toBeNull();
        expect(onValidationChange).toHaveBeenLastCalledWith(expect.objectContaining({ valid: true }));
    });

    test("Przycisk Wyczyść resetuje wartość do null", () => {
        const onChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                defaultValue={new Date(Date.UTC(2025, 0, 1))}
                onChange={onChange}
            />,
        );

        const clearButton = screen.getByRole("button", { name: "Wyczyść" });
        fireEvent.click(clearButton);

        expect(onChange).toHaveBeenLastCalledWith(null, expect.anything());
    });

    test("Wyczyszczenie wymaganego pola (fillRequired=All) zgłasza date-required", () => {
        const onValidationChange = vi.fn();
        render(
            <DateTimePicker
                dateTimePrecisions={DateTimePickerPrecision.Date}
                defaultValue={new Date(Date.UTC(2025, 0, 1))}
                fillRequired={FillRequired.All}
                onValidationChange={onValidationChange}
            />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);

        expect(onValidationChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                valid: false,
                reason: "date-required",
                message: expect.any(String),
            }),
        );
    });

    test("Imperatywne validate() przez ref zwraca błąd date-required dla pustej wartości wymaganej", () => {
        const ref = createRef<DateTimePickerHandle>();
        render(
            <DateTimePicker
                ref={ref}
                dateTimePrecisions={DateTimePickerPrecision.Date}
                fillRequired={FillRequired.All}
            />,
        );

        const result = ref.current!.validate();
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("date-required");
    });

    test("Imperatywne validate() przez ref zwraca valid dla poprawnej wartości", () => {
        const ref = createRef<DateTimePickerHandle>();
        render(
            <DateTimePicker
                ref={ref}
                dateTimePrecisions={DateTimePickerPrecision.Date}
                value={new Date(Date.UTC(2026, 6, 29))}
            />,
        );

        const result = ref.current!.validate();
        expect(result.valid).toBe(true);
    });
});
