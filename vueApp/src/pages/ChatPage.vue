<template>
	<div>
		<button class="logout" @click="onLogout">Logout</button>
		<h1>Hi {{(user||{}).name}} ! , Welcome to Trootech Chat App</h1>
		<online-users
			:users="onlineUsers"
			@onUserSelect="onUserSelected"
			:selectedUserId="selectedPartnerUser.id"
			:unreadMessages="unreadMessages"
		/>
		<div class="chat-page-container" v-if="selectedPartnerUser.id">
			<div class="chat-messsage-container">
				<div v-if="selectedPartnerUser.id" class="chat-person-header">{{selectedPartnerUser.name}}</div>
				<div class="single-message" v-for="(m, index) in messageList" :key="index">
					<div class="message my-message" v-if="m._from == user.userId">
						<div v-if="!m.attachment">
							<span class="cross" @click="onDeleteMessage(m, index)">✖</span>
							<p>{{m.message}}</p>
						</div>	
						<div v-else>
							<span class="cross" @click="onDeleteMessage(m, index)">✖</span>
							<img :src="`${API_END}${m.attachment}`"/>
						</div>
					</div>
					<div class="message other-message" v-if="m._from != user.userId">
						<div v-if="!m.attachment">
							<span class="cross" @click="onDeleteMessage(m, index)">✖</span>
							<p>{{m.message}}</p>
						</div>
						<div v-else>
							<span class="cross" @click="onDeleteMessage(m, index)">✖</span>
							<img :src="`${API_END}${m.attachment}`"/>
						</div>
					</div>
				</div>
				<div v-show="!messageList.length">No previous conversion found</div>
				<div class="typing" v-if="typing">
					<p>typing...</p>
				</div>
			</div>
			<div class="send-message-container">
				<textarea
					class="message-send-input"
					cols="80"
					rows="3"
					type="text"
					v-model="message"
					@keyup="onKeyUp"
					@keydown="onKeyDown"
				/>
				<div class="emoji-container" v-show="emojiSelectorVisible">
					<span class="close" @click="emojiSelectorVisible = false">✖</span>
					<picker :showPreview="false" set="apple" :infiniteScroll="false" @select="onEmojiSelect" />
				</div>
			</div>
			<button class="send-button" @click="sendMessage()">Send</button>
			<div class="chat-feature-container">
				<div class="emoji-selector" @click="emojiSelectorVisible = true">😍</div>
				<input class="attachment-selector" type="file" accept=".png, .jpg, .jpeg" multiple @change="onFileChange" />
			</div>
		</div>
		<div v-else>
			<h3>Select partner to chat</h3>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';
import { Picker } from 'emoji-mart-vue';

import OnlineUsers from '../components/OnlineUsers';

import AuthService from "../services/Auth.service";
import MessageService from "../services/Message.service";

const API_END = process.env.VUE_APP_API_END_POINT;

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000/chat'
}));

var onlineUsersInterval;

export default {
	name: 'ChatPage',
	components: {
		OnlineUsers,
		Picker
	},
	data() {
		return {
			API_END,
			authService: new AuthService(),
			messageService: new MessageService(),
			message:  "",
			user: null,
			messageList: [],
			typing: false,
			onlineUsers: [],
			selectedPartnerUser: {id: null},
			attachments: [],
			unreadMessages: {},
			emojiSelectorVisible: false
		}
	},
	sockets: {
        connect: function () {
            console.log('socket connected')
        },
        "on-new-message": function (data) {
            console.log("server emit data", data);
		},
		"typing-start": function (data) {
            console.log("server emit data", data);
		},
		"typing-end": function (data) {
            console.log("server emit data", data);
		},
		"online-users": function (data) {
            console.log("server emit data", data);
		},
		"message-deleted": function(data) {
			console.log("server emit data", data);
		}
    },
	methods: {
		onLogout() {
			this.authService.logout();
		},
		onFileChange(e) {
			console.log("here filed", e.target.files);
			this.attachments = e.target.files;
			if(!this.attachments.length) return;
			let formData = new FormData();
			this.attachments.forEach(a => {
				formData.append("file", a);
			});
			formData.append("_from", this.user.userId);
			formData.append("_to", this.selectedPartnerUser.id);
			formData.append("type", "attachment");
			this.messageService.sendAttachments(formData).then(res => {
				console.log("here res", res);
				res.data.messages.forEach(m => {
					this.messageList.push(m);
					this.$socket.emit("send-message", m);
				})
			}, (err) => {
				console.log("here err", err);
			});
		},
		onDeleteMessage(message, index) {
			let response = confirm("Are you sure to delete the message ?");
			if (response) {
				this.messageList.splice(index, 1);
				this.messageService.deleteMessage(message).then(res => {
					console.log("res", res, message.id);
					this.$socket.emit("delete-message", {
						from: this.user.userId,
						to: this.selectedPartnerUser.id,
						messageId: message.id
					});
				}, (err) => console.log("err", err));
			}
		},
		onEmojiSelect(emoji) {
			console.log("Emoji", emoji);
			this.message += emoji.native;
		},
		sendMessage() {
			console.log("here text ", this.message);
			if(!this.message.trim()) {
				this.message = "";
				return;
			}
			this.messageService.sendMessage({
				_to: this.selectedPartnerUser.id,
				_from: this.user.userId,
				message: this.message,
				type: "text",
				identifier: 'user'+this.user.userId+":user"+this.selectedPartnerUser.id,
				attachment: ""
			}).then(res => {
				console.log(res);
				if(res.data.message) {
					this.messageList.push(res.data.message);
					this.$socket.emit("send-message", res.data.message);
				}
			}, (err) => console.log(err));
			this.message = "";
		},
		onUserSelected(user) {
			this.selectedPartnerUser = user;
			this.unreadMessages[user.id] = 0;
			this.messageService.getMessages({
				to: this.selectedPartnerUser.id,
				from: this.user.userId
			}).then(res => {
				console.log("res", res);
				this.messageList = res.data.messages;
			}, (err) => {
				console.log("err", err);
			})
		},
		onKeyUp() {
			this.$socket.emit("typing-end", {
				_to: this.selectedPartnerUser.id
			});
		},
		onKeyDown() {
			this.$socket.emit("typing-start", {
				_to: this.selectedPartnerUser.id
			});
		}
	},
	mounted() {
		this.user = this.authService.getCurrentUser();
		this.$socket.emit('user-connected', {
			userId: this.user.userId,
			name: this.user.name
		});

		onlineUsersInterval = setInterval(() => {
			this.$socket.emit('find-online-users', {
				from: this.user.userId
			});
		}, 5000);

		this.sockets.listener.subscribe('on-new-message', (data) => {
			console.log("new message", data);
			this.messageList.push(data);
			if(!this.selectedPartnerUser.id) {
				this.unreadMessages[data._from] ? null: (this.unreadMessages[data._from] = 0);
				this.unreadMessages[data._from] += 1;
				this.unreadMessages = {...this.unreadMessages};
				console.log("here unread messages", this.unreadMessages);
			}
			if(this.selectedPartnerUser.id && this.selectedPartnerUser.id != data._from) {
				this.unreadMessages[data._from] ? null: (this.unreadMessages[data._from] = 0);
				this.unreadMessages[data._from] += 1;
				this.unreadMessages = {...this.unreadMessages};
				console.log("here unread messages", this.unreadMessages);
			}
		});

		this.sockets.listener.subscribe('typing-start', () => {
			this.typing = true;
		});

		this.sockets.listener.subscribe('typing-end', () => {
			this.typing = false;
		});

		this.sockets.listener.subscribe('online-users', (onlineUsers) => {
			this.onlineUsers = onlineUsers.users;
		});

		this.sockets.listener.subscribe('message-deleted', (messageId) => {
			let index = this.messageList.findIndex(m => m.id == messageId);
			console.log("message list, index, message id", this.messageList, index, messageId);
			console.log("deleteed message id ", index);
			if (index >= 0) {
				this.messageList.splice(index, 1);
			}
		});
	},
	beforeDestroy() {
		this.$socket.emit("user-disconnected");
		onlineUsersInterval && clearInterval(onlineUsersInterval);
	}
}
</script>

<style lang="scss">
	@import 'src/assets/scss/chatpage.scss';
</style>
