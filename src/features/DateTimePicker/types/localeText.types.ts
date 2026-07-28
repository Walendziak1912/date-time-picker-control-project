export type DateTimePickerLocaleText = {
  //7 etykiet od poniedziałku do niedzieli
  weekdayLabels?: string[];
  //12 etykiet miesięcy (sty–gru)
  monthLabels?: string[];
  cancel?: string;
  ok?: string;
  today?: string;
  clear?: string;
  openPicker?: string;
  dialog?: string;
  prev?: string;
  next?: string;
  switchCalendarView?: string;
  month?: string;
  year?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  milliseconds?: string;
  meridiem?: string;
  invalidFormat?: string;
};

export type ResolvedLocaleText = {
  weekdayLabels: string[];
  monthLabels: string[];
  cancel: string;
  ok: string;
  today: string;
  clear: string;
  openPicker: string;
  dialog: string;
  prev: string;
  next: string;
  switchCalendarView: string;
  month: string;
  year: string;
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
  meridiem: string;
  invalidFormat: string;
};
