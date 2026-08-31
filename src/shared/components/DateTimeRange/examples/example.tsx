import { BackendIntegrationExample } from "./BackendIntegrationExample";
import { EmissionAnalysisExample } from "./EmissionAnalysisExample";
import { FormWithValidationExample } from "./FormWithValidationExample";
import {
  MultiPrecisionExample,
  PrecisionSwitchExample,
} from "./PrecisionExamples";
import {
  MaxRangeDaysExample,
  MillisecondsRangeExample,
  SecondsRangeExample,
  TimeOnlyRangeExample,
} from "./PrecisionVariantsExample";
import { CustomLabelsExample, DefaultLabelsExample } from "./LabelsExample";
import { FlexDatesExample, PresetsExample } from "./PresetsAndFlexExample";
import { SimpleFormExample } from "./SimpleFormExample";

export const ExampleDateTimeRange: React.FC = () => (
  <section className="flex flex-column gap-3">
    <header className="flex flex-column gap-2 mb-1">
      <h1 className="m-0 text-3xl font-bold">DateTimeRange</h1>
      <p className="text-color-secondary m-0 line-height-3">
        Przykłady zakresów dat z integracją backendu i walidacją.
      </p>
    </header>
    <div className="grid">
      <div className="col-12">
        <BackendIntegrationExample />
      </div>
      <div className="col-12">
        <FormWithValidationExample />
      </div>
      <div className="col-12 lg:col-6">
        <SimpleFormExample />
      </div>
      <div className="col-12 lg:col-6">
        <DefaultLabelsExample />
      </div>
      <div className="col-12 lg:col-6">
        <CustomLabelsExample />
      </div>
      <div className="col-12 lg:col-6">
        <PrecisionSwitchExample />
      </div>
      <div className="col-12 lg:col-6">
        <MultiPrecisionExample />
      </div>
      <div className="col-12 lg:col-6">
        <SecondsRangeExample />
      </div>
      <div className="col-12 lg:col-6">
        <MillisecondsRangeExample />
      </div>
      <div className="col-12 lg:col-6">
        <MaxRangeDaysExample />
      </div>
      <div className="col-12 lg:col-6">
        <TimeOnlyRangeExample />
      </div>
      <div className="col-12">
        <PresetsExample />
      </div>
      <div className="col-12">
        <FlexDatesExample />
      </div>
      <div className="col-12">
        <EmissionAnalysisExample />
      </div>
    </div>
  </section>
);
