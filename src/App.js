import React, { useState } from "react";
import Input from "./components/common/Input/Input";
import Button from "./components/common/Button/Button";

const App = () => {
    const [message, setMessage] = useState("");
    const [data1, setData1] = useState("Initial State Message");

    const handleButtonClick1 = () => {
        setData1("Updated Initial State Message");
    };

    return (
        <div>
            <h1>Learn React</h1>
            <p>{data1}</p>

            {/* Custom Components */}
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <Button onClick={handleButtonClick1} />
        </div>
    );
};

export default App;

