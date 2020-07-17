import axios from "axios";
import * as jwtDecode from "jwt-decode";

const API_END = process.env.VUE_APP_API_END_POINT;

export default class AuthService {
    login(body) {
        return axios.post(API_END+"login", body);
    }

    getCurrentUser() {
        try {
            let decoded = jwtDecode(localStorage.getItem("chatSession"));
            console.log("decoded", decoded);
            if(decoded && decoded.userId) {
                return decoded;
            } else {
                throw new Error();
            }
        }
        catch(err) {
            console.log("Error", err);
            this.logout();
        }
    }

    logout() {
        localStorage.removeItem("chatSession");
        location.reload();
    }
}