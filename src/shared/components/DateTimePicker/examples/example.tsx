import { BackendIntegrationExample } from "./BackendIntegrationExample";
import { FormWithValidationExample } from "./FormWithValidationExample";
import { LabelExample } from "./LabelsExample";
import {
  ControlledPrecisionExample,
  PrecisionDropdownExample,
  PrecisionSwitchTwoModesExample,
} from "./PrecisionExamples";
import {
  DateOnlyExample,
  DateTimeExample,
  DateTimeMillisecondsExample,
  DateTimeSecondsExample,
  DigitalClockExample,
  RequiredDateExample,
  TimeExample,
  TimeMillisecondsExample,
  TimeSecondsExample,
} from "./VariantExamples";

export const ExampleDateTimePicker: React.FC = () => (
  <section className="flex flex-column gap-3">
    <header className="flex flex-column gap-2 mb-1">
      <h1 className="m-0 text-3xl font-bold">DateTimePicker</h1>
      <p className="text-color-secondary m-0 line-height-3">
        Przykłady pojedynczego pickera daty i czasu.
      </p>
    </header>
    <div className="grid">
      <div className="col-12">
        <BackendIntegrationExample />
      </div>
      <div className="col-12 lg:col-6">
        <FormWithValidationExample />
      </div>
      <div className="col-12 lg:col-6">
        <PrecisionSwitchTwoModesExample />
      </div>
      <div className="col-12 lg:col-6">
        <PrecisionDropdownExample />
      </div>
      <div className="col-12 lg:col-6">
        <ControlledPrecisionExample />
      </div>
      <div className="col-12 lg:col-6">
        <LabelExample />
      </div>
      <div className="col-12 lg:col-6">
        <DateTimeExample />
      </div>
      <div className="col-12 lg:col-6">
        <DateTimeSecondsExample />
      </div>
      <div className="col-12 lg:col-6">
        <DateTimeMillisecondsExample />
      </div>
      <div className="col-12 lg:col-6">
        <DateOnlyExample />
      </div>
      <div className="col-12 lg:col-6">
        <TimeExample />
      </div>
      <div className="col-12 lg:col-6">
        <TimeSecondsExample />
      </div>
      <div className="col-12 lg:col-6">
        <TimeMillisecondsExample />
      </div>
      <div className="col-12 lg:col-6">
        <DigitalClockExample />
      </div>
      <div className="col-12 lg:col-6">
        <RequiredDateExample />
      </div>
    </div>
  </section>
);
