<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
        
            <router-link class="navbar-brand" to="/">
                Chat Station
            </router-link>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarColor01">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <router-link class="nav-link active" to="/">
                            Home
                        </router-link>
                    </li>

                    <li class="nav-item" v-if="!login">
                        <router-link class="nav-link" to="/login">Login</router-link>
                    </li>

                    <li class="nav-item" v-if="!login">
                        <router-link class="nav-link" to="/register">Register</router-link>
                    </li>

                    <li class="nav-item dropdown" v-if="login">
                        <a v-text="user.name" class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><router-link to="/profile" class="dropdown-item">Profile</router-link></li>

                            <li><a class="dropdown-item" v-on:click="doLogout" href="javascript:void(0);">Logout</a></li>
                        </div>
                    </li>

                    <li class="nav-item" v-if="login">
                        <router-link class="nav-link" to="/notifications">
                            <i class="fa fa-bell"></i>
                            <span class="badge" v-if="unreadNotifications > 0" v-text="unreadNotifications"></span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link class="nav-link" to="/premiumVersion">Premium version</router-link>
                    </li>
                </ul>

                <form class="d-flex" v-on:submit.prevent="doSearch" v-if="false">
                    <input class="form-control me-sm-2" type="text" v-model="query" placeholder="Search">
                    <button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>
</template>

<script>

    import axios from "axios"
    import swal from "sweetalert2"
    import { io } from 'socket.io-client'
    import store from "../../vuex/store"

    export default {
        data() {
            return {
                login: false,
                user: null,

                // get value from search input field
                query: ""
            }
        },

        computed: {
            unreadNotifications() {
                return store.getters.getUnreadNotifications
            }
        },

        methods: {

            doSearch: async function () {
                // create form data object and add searched query in it
                const formData = new FormData()
                formData.append("query", this.query)

                // call an AJAX to the server
                const response = await axios.post(
                    this.$apiURL + "/search",

                    // send the form data object with the request
                    formData,

                    // pass headers that contains access token
                    // so the server will know which user's contact to search
                    {
                        headers: this.$headers
                    }
                )

                if (response.data.status == "success") {
                    // set the contacts array to the one received from API
                    store.commit("setContacts", response.data.contacts)
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            },

            doLogout: async function () {
                const response = await axios.post(
                    this.$apiURL + "/logout",
                    null,
                    {
                        headers: this.$headers
                    }
                );

                localStorage.removeItem(this.$accessTokenKey)
                this.$user = null
                this.user = null
                this.login = false
                store.commit("setUser", null)
                store.commit("setUnreadNotifications", 0)
                store.commit("setNotifications", [])

                this.$router.push({
                    path: "/login"
                })
            },

            getUser: async function () {
                const self = this

                // check if user is logged in
                if (localStorage.getItem(this.$accessTokenKey)) {
                    const response = await axios.post(
                        this.$apiURL + "/getUser",
                        null,
                        {
                            headers: this.$headers
                        }
                    )

                    if (response.data.status == "success") {
                        // user is logged in
                        this.$user = response.data.user

                        store.commit("setUser", response.data.user)
                        store.commit("setUnreadNotifications", response.data.unreadNotifications)
                        store.commit("setNotifications", response.data.user.notifications)

                        if (typeof socketIO !== "undefined") {
                            socketIO.emit("connected", this.$user.email)

                            socketIO.on("sendMessage", async function (data) {
                                if (self.$route.path == "/chat/" + data.data.sender.email) {
                                    store.commit("appendMessage", data.data)
                                }

                                let tempContacts = self.$user.contacts
                                for (let a = 0; a < tempContacts.length; a++) {
                                    if (tempContacts[a]._id == data.data.sender._id) {
                                        tempContacts[a].unreadMessages++
                                    }
                                }
                                store.commit("setContacts", tempContacts)

                                const Toast = swal.mixin({
                                    toast: true,
                                    position: 'bottom-right',
                                    customClass: {
                                        popup: 'colored-toast'
                                    },
                                    showConfirmButton: false,
                                        timer: 10000,
                                        timerProgressBar: true
                                    })
                                
                                await Toast.fire({
                                    title: data.title
                                })
                            })
                        }
                    } else {
                        // user is logged out
                        localStorage.removeItem(this.$accessTokenKey);
                    }

                    this.login = (localStorage.getItem(this.$accessTokenKey) != null);
                } else {
                    this.login = false;
                }

                global.user = this.user
            },
        },

        computed: {
            user() {
                return store.getters.getUser
            }
        },

        mounted: function () {
            this.getUser();

            global.socketIO = io(this.$apiURL)
        }
    }
</script>