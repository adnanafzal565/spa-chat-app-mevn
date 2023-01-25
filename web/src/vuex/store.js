import { createStore } from "vuex"

export default createStore({
    state() {
        return {
            messages: [],
            contacts: [],

            // initialize groups array
            groups: [],

            groupMessages: [],

            unreadNotifications: 0,
            notifications: [],

            user: null
        }
    },

    mutations: {
        setUser (state, user) {
            state.user = user
        },

        setNotifications (state, notifications) {
            state.notifications = notifications
        },

        setUnreadNotifications (state, unreadNotifications) {
            state.unreadNotifications = unreadNotifications
        },

        // set the groups value
        setGroups (state, newGroups) {
            state.groups = newGroups
        },

        appendGroupMessage (state, newMessage) {
            state.groupMessages.push(newMessage)
        },

        appendMessage (state, newMessage) {
            state.messages.push(newMessage)
        },

        prependMessage (state, newMessage) {
            state.messages.unshift(newMessage)
        },

        prependGroupMessage (state, newMessage) {
            state.groupMessages.unshift(newMessage)
        },

        setGroupMessages (state, newMessages) {
            state.groupMessages = newMessages
        },

        setMessages (state, newMessages) {
            state.messages = newMessages
        },

        setContacts (state, newContacts) {
            state.contacts = newContacts
        }
    },

    getters: {
        getUser (state) {
            return state.user
        },
        
        getGroupMessages (state) {
            return state.groupMessages
        },

        getNotifications (state) {
            return state.notifications
        },

        getUnreadNotifications (state) {
            return state.unreadNotifications
        },

        // get the state groups
        getGroups (state) {
            return state.groups
        },

        getMessages (state) {
            return state.messages
        },

        getContacts (state) {
            return state.contacts
        }
    }
})