import { Button } from "./components/ui/button";

const App = () => {
  return (
    <div className="flex flex-col gap-4 w-100vw h-100vh items-center justify-center">
      <h1 className="text-2xl font-bold">Chat App</h1>
      <Button>Send Message</Button>
    </div>
  );
};

export default App;
