import { DateTimePickerExample } from "./features/DateTimePicker/example";
import { DateTimeRangeExample } from "./features/DateTimeRange/example";
import "./example/exampleLayout.css";

function App() {
  return (
    <div className="examples-page">
      <DateTimePickerExample />
      <DateTimeRangeExample />
    </div>
  );
}

export default App;
