// reducers.js
const initialState = {
    isAuthenticated: false,
    userData: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
            };

        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                userData: null,
            };

        case 'SET_USER_DATA':
            console.log(action.payload);
            return {
                ...state,
                userData: action.payload,
            };

        default:
            return state;
    }
};

export default authReducer;
