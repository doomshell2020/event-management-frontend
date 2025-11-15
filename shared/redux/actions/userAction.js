
export const setAuthToken = (token) => ({
    type: 'SET_AUTH_TOKEN',
    payload: token,
});

export const clearAuthToken = (token) => ({
    type: 'CLEAR_AUTH_TOKEN',
    payload: token

});

export const authError = (error) => ({
    type: 'AUTH_ERROR',
    payload: error,
});



// actions.js
export const login = (userData) => ({
    type: 'LOGIN',
    payload: userData,
});

export const logout = () => ({
    type: 'LOGOUT',
});

export const setUserData = (userData) => ({
    type: 'SET_USER_DATA',
    payload: userData,
},
);
