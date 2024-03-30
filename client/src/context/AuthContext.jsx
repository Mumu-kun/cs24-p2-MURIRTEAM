import { createContext, useReducer } from "react";

// Define the initial state
const initialState = {
	isAuthenticated: false,
	user: null,
};

// Define the reducer function
const reducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			window.localStorage.setItem("user", JSON.stringify(action.payload));

			return {
				...state,
				isAuthenticated: true,
				user: action.payload,
			};
		case "LOGOUT":
			window.localStorage.removeItem("user");

			return {
				...state,
				isAuthenticated: false,
				user: null,
			};
		default:
			return state;
	}
};

// Create the authentication context
export const AuthContext = createContext();

// Create the authentication provider component
export const AuthProvider = ({ children }) => {
	const [authState, dispatch] = useReducer(
		reducer,
		window.localStorage.getItem("user")
			? {
					isAuthenticated: true,
					user: JSON.parse(window.localStorage.getItem("user")),
				}
			: initialState
	);

	const login = (user) => {
		dispatch({ type: "LOGIN", payload: user });
	};

	const logout = () => {
		dispatch({ type: "LOGOUT" });
	};

	return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>;
};
