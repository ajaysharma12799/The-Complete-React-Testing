import React from "react";

const Input = ({
    type = "text",
    placeholder = "Enter Something",
    value,
    onChange,
}) => {
    return (
        <div>
            <input
                type={type}
                placeholder={placeholder}
                title="custom-input"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;
