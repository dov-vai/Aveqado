import './App.css'
import {useState} from "react";
import EqGraph from "./components/EQGraph/EqGraph.tsx";
import {Filter} from "./components/EQGraph/filter.ts";

function App() {
    const [filters, setFilters] = useState<Filter[]>([
        {type: 'peak', frequency: 50, Q: 2, gain: 5},
        {type: 'peak', frequency: 1000, Q: 1, gain: -1},
        {type: 'peak', frequency: 5000, Q: 5, gain: 3}
    ]);

    return (
        <>
            <EqGraph filters={filters}/>
        </>
    )
}

export default App
