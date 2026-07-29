# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Domyślne formaty dat

| Konfiguracja                                           | Domyślny format           |
| ------------------------------------------------------ | ------------------------- |
| `mode="date"`                                          | `dd.MM.yyyy`              |
| `mode="time"`                                          | `HH:mm`                   |
| `mode="time"` + `showSeconds`                          | `HH:mm:ss`                |
| `mode="time"` + `showSeconds` + `showMilliseconds`     | `HH:mm:ss:SSS`            |
| `mode="datetime"` (domyślny)                           | `dd.MM.yyyy HH:mm`        |
| `mode="datetime"` + `showSeconds`                      | `dd.MM.yyyy HH:mm:ss`     |
| `mode="datetime"` + `showSeconds` + `showMilliseconds` | `dd.MM.yyyy HH:mm:ss:SSS` |

`<DateTimePicker
  value={value}
  onChange={setValue}
  format="yyyy-MM-dd HH:mm"
/>`

`<DateTimeRange
  value={range}
  onChange={setRange}
  format="yyyy-MM-dd'T'HH:mm:ss.SSS"
/>`

Różne formaty na range
`<DateTimeRange
value={range}
onChange={setRange}
startProps={{ format: 'dd.MM.yyyy HH:mm' }}
endProps={{ format: 'dd.MM.yyyy HH:mm:ss' }}
/>`
