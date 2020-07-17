<template>
	<div class="login-page-container">
		<h1>Login</h1>
		<input
            type="text"
            placeholder="Enter username"
            v-model="user.username"
        />
        <input
            type="password"
            placeholder="Enter password"
            v-model="user.password"
        />
		<button
            class="login-button"
            @click="doLogin()"
        >
            Login
        </button>
	</div>
</template>

<script>
import AuthService from "../services/Auth.service";

class User {
    username = "";
    password = "";
    constructor(username, password) {
      this.username = username;
      this.password = password;  
    }
}
export default {
	name: 'LoginPage',
	data() {
		return {
            user: new User(),
            authService: new AuthService()
		}
	},
	methods: {
		doLogin() {
            console.log("here user object " , this.user);
            if(!this.user.username || !this.user.password) {
                alert("Username and password are required");
                return;
            }
            this.authService.login(this.user).then(res => {
                localStorage.setItem("chatSession", res.data.accessToken);
                this.$router.push({ path: "/chat" });
            }, (err) => {
                alert(err.response.data.message);
            });
        }
	}
}
</script>

<style lang="scss">
.login-page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    input {
        width: 300px;
        margin-bottom: 20px;
        padding: 10px;
        font-size: 16px;
    }
    .login-button {
        background-color: #fff;
        padding: 8px;
        cursor: pointer;
        width: 150px;
    }
}
</style>
