import React from "react";

const Button = ({ label = "Default Button Label", onClick }) => {
    return (
        <div>
            <button onClick={onClick}>{label}</button>
        </div>
    );
};

export default Button;
