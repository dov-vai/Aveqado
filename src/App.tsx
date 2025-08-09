import './App.css';
import { ConfigProvider } from './context/ConfigContext/ConfigContext.tsx';
import { Config } from './utils/config.ts';
import Home from './components/Home/Home.tsx';
import Resonance from './components/Resonance/Resonance.tsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <ConfigProvider config={new Config()}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resonance" element={<Resonance />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
