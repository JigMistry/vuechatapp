<template>
	<div class="online-users-container">
		<p
			v-for="(user, index) in users"
			:key="index"
			@click="onUserSelect(user)"
			v-bind:class="[selectedUserId == user.id ? 'selected': '']"
		>
			<span class="notification" v-show="unreadMessages[user.id]">{{unreadMessages[user.id]}}</span>
			<span class="dot"></span>
			{{user.name}}
		</p>
	</div>
</template>

<script>
export default {
	name: 'OnlineUsers',
	props: {
		users: {
			type: Array,
			default: function () {
				return [];
			}
		},
		selectedUserId: {
			type: Number
		},
		unreadMessages: {
			type: Object
		}
	},
	methods: {
		onUserSelect(user) {
			this.$emit("onUserSelect", user);
		}
	},
	mounted() {

	}
}
</script>

<style scoped lang="scss">
.online-users-container {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
	p {
		padding: 5px;
		// border: 1px solid black;
		box-shadow: 1px 1px 10px #4e3e3e;
		margin-right: 10px;
		border-radius: 10px;
		cursor: pointer;
		position: relative;
		&.selected {
			border: 2px solid #2e6fa7;
		}
		&:active {
			transform: scale(.9);
		}
		.dot {
			height: 10px;
			width: 10px;
			background-color: green;
			border-radius: 50%;
			display: inline-block;
			margin-right: 5px;
		}
		.notification {
			position: absolute;
			background-color: #ff5252;
			color: #fff;
			width: 20px;
			height: 20px;
			font-size: 15px;
			font-weight: 600;
			right: -10px;
			top: -12px;
			border-radius: 50%;
		}
	}
}
</style>
