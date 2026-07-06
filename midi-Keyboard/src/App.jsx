import { MappingProvider } from './state/MappingContext.jsx';
import MappingStudio from './components/ui/MappingStudio.jsx';

export default function App() {
  return (
    <MappingProvider>
      <MappingStudio />
    </MappingProvider>
  );
}
