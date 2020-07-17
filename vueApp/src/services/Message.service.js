import axios from "axios";

const API_END = process.env.VUE_APP_API_END_POINT;

export default class MessageService {

    sendMessage(body) {
        return axios.post(API_END+"chat/message", body);
    }

    getMessages(body) {
        return axios.get(API_END+"chat/message/"+body.from+"/"+body.to);
    }

    deleteMessage(message) {
        return axios.delete(API_END+"chat/message/"+message.id, { data: { message }});
    }

    sendAttachments(formData) {
        return axios.post(API_END+"chat/uploadmultiple/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}