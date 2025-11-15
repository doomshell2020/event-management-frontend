import { combineReducers } from "redux";
import { cartreducer } from "./reducer";
import { authReducer } from "./userReducer";
const rootred = combineReducers({
    cartreducer
});


export default rootred