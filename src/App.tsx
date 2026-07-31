import { ExampleDateTimePicker } from "./shared/components/DateTimePicker/examples/example";
import { ExampleDateTimeRange } from "./shared/components/DateTimeRange/examples/example";
import { ToastContainer, toast } from "react-toastify";

function App() {
  return (
    <>
      <ExampleDateTimePicker />
      <ExampleDateTimeRange />
      <ToastContainer />
    </>
  );
}

export default App;
