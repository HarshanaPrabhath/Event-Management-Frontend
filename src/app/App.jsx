import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
