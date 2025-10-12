import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex min-h-svh  bg-background flex-col items-center justify-center">
      <Button variant={"destructive"} className="text-black">
        Click me
      </Button>
    </div>
  );
}

export default App;
