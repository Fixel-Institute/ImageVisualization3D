import React from "react";

const VisualizerContext = React.createContext();
VisualizerContext.displayName = "Visualization Tool Context";

// Example Call: dispatch({type: "language", value: value});
function reducer(state, action) {
    return { ...state, [action.type]: action.value }
}

function VisualizerContextProvider({initialStates, children}) {
    const [controller, dispatch] = React.useReducer(reducer, initialStates);
    const value = React.useMemo(() => [controller, dispatch], [controller, dispatch]);
    return <VisualizerContext.Provider value={value}>{children}</VisualizerContext.Provider>;
}

function useVisualizerContext() {
    const context = React.useContext(VisualizerContext);
    if (!context) {
        throw new Error();
    }
    return context;
}

export {
    VisualizerContextProvider,
    useVisualizerContext,
}