import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
	mode: 'history',
	routes: [
        {
            path: "/",
            beforeEnter: (to, from , next) => {
                if(localStorage.getItem("chatSession")) {
                    next("/chat");
                } else {
                    next("/login");
                }
            }
        },
        {
			path: '/login',
			name: 'ChatPage',
            component: () => import('./pages/LoginPage.vue')
        },
		{
			path: '/chat',
			name: 'ChatPage',
            component: () => import('./pages/ChatPage.vue'),
            beforeEnter: (to, from , next) => {
                if(localStorage.getItem("chatSession")) {
                    next();
                } else {
                    next("/login");
                }
            }
        },
        {
            path: "**",
            redirect: "/chat"
        }
    ]
});

export default router;

