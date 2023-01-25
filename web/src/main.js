import { createApp } from 'vue'
import App from './App.vue'

// import the vue router necessary functions
import { createRouter, createWebHistory } from 'vue-router'

import RegisterComponent from "./components/RegisterComponent.vue"
import LoginComponent from "./components/LoginComponent.vue"

import HomeComponent from "./components/HomeComponent.vue"
import AddContactComponent from "./components/AddContactComponent.vue"
import ChatComponent from "./components/ChatComponent.vue"

import NotificationsComponent from "./components/NotificationsComponent.vue"

import ProfileComponent from "./components/ProfileComponent.vue"
import PremiumVersionComponent from "./components/PremiumVersionComponent.vue"

// Define some routes
// Each route should map to a component.
const routes = [
    { path: "/profile", component: ProfileComponent },

    { path: '/', component: HomeComponent },
    { path: "/contacts/add", component: AddContactComponent },

    { path: "/chat/:email", component: ChatComponent },

    { path: '/register', component: RegisterComponent },
    { path: '/login', component: LoginComponent },

    { path: "/notifications", component: NotificationsComponent },
    { path: "/premiumVersion", component: PremiumVersionComponent }
];

// Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
    // Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

const app = createApp(App)
app.use(router)

document.title = "Chat Station"

app.config.globalProperties.$mainURL = "http://localhost:8080"
app.config.globalProperties.$apiURL = "http://localhost:3000"
app.config.globalProperties.$accessTokenKey = "accessTokenKey"
app.config.globalProperties.$months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

app.config.globalProperties.$user = null;
app.config.globalProperties.$login = false;
app.config.globalProperties.$headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem("accessTokenKey")
};

app.mount('#app')