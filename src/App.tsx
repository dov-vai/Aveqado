import './App.css'
import {ConfigProvider} from "./components/Providers/ConfigProvider.tsx";
import {Config} from "./utils/config.ts";
import Home from "./components/Home/Home.tsx";

function App() {
    return (
        <ConfigProvider config={new Config()}>
            <Home/>
        </ConfigProvider>
    )
}

export default App;
