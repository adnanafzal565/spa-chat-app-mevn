<template>
    <div class="container-fluid" id="home-page" style="padding-top: 50px; padding-bottom: 50px;">
        <div class="row" style="margin-bottom: 50px;">
            <div class="offset-md-10 col-md-2">
                <router-link class="btn btn-primary" to="/contacts/add">Add Contact</router-link>
            </div>
        </div>

        <div class="container-fluid h-100">
            <div class="row justify-content-center h-100">
                <div class="col-md-4 col-xl-3 chat"><div class="card mb-sm-3 mb-md-0 contacts_card">
                    <div class="card-header">
                        <div class="input-group">
                            <input type="text" placeholder="Search..." class="form-control search" v-model="searchContact" v-on:keypress="onSearchKeyPress" v-on:keyup="onSearchKeyUp" />
                            <div class="input-group-prepend">
                                <span class="input-group-text search_btn"><i class="fa fa-search" v-on:click="doSearchContact"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body contacts_body">
                        <ul class="contacts">
                            <li v-for="contact in contacts" v-bind:key="contact._id" v-bind:class="contact._id == _id ? 'active' : ''">
                                <div class="d-flex bd-highlight">
                                    <div class="user_info">
                                        <span v-text="contact.name" style="cursor: pointer;" v-bind:data-id="contact._id" v-bind:data-name="contact.name" v-bind:data-is-archive="contact.isArchive" v-on:click="onChatSelected"></span>
                                        <p v-if="(contact.unreadMessages > 0)" v-text="' (' + contact.unreadMessages + ')'" class="text-danger"></p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card-footer"></div>
                </div></div>
                <div class="col-md-8 col-xl-6 chat">
                    <div class="card">
                        <div class="card-header msg_head">
                            <div class="d-flex bd-highlight">
                                <div class="user_info">
                                    <span>Chat with <span v-text="name"></span></span>
                                    <p><span v-text="totalMessages" style="font-size: 10px; color: rgba(255,255,255,0.6);"></span> Messages</p>
                                </div>
                            </div>

                            <span id="action_menu_btn" class="more-options" v-on:click="showContactOptions"></span>
                        </div>
                        <div class="card-body msg_card_body">

                            <div v-for="msg in messages" v-bind:key="msg._id">

                                <template v-if="user != null && user.email == msg.sender.email">
                                    <div class="d-flex justify-content-end mb-4">
                                        <div class="msg_cotainer_send">
                                            <template class="more-options" v-on:click="showMoreOptions(msg)" v-bind:is-my-message="true">
                                                <span v-text="msg.message"></span>
                                            </template>

                                            <p class="msg_time message-data-time" v-text="getMessageTime(msg.createdAt)"></p>
                                        </div>

                                        <div class="img_cont_msg">
                                            <img v-bind:src="getPicture(msg.sender)" class="rounded-circle user_img_msg" />
                                        </div>
                                    </div>
                                </template>

                                <template v-else>
                                    <div class="d-flex justify-content-start mb-4">
                                        <div class="img_cont_msg">
                                            <img v-bind:src="getPicture(msg.sender)" class="rounded-circle user_img_msg" />
                                        </div>

                                        <div class="msg_cotainer">
                                            <template class="more-options" v-on:click="showMoreOptions(msg)" v-bind:is-my-message="false">
                                                <span v-text="msg.message"></span>
                                            </template>

                                            <p class="msg_time message-data-time" v-text="getMessageTime(msg.createdAt)"></p>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="input-group">
                                <textarea v-model="message" class="form-control type_msg" placeholder="Type your message..."></textarea>
                                <div class="input-group-append">
                                    <span class="input-group-text send_btn"><i class="fa fa-location-arrow" v-on:click="sendMessage"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="contextMenuContactOptions" class="context-menu" style="display: none"> 
        <ul class="menu">
            <li><a href="javascript:void(0)" v-on:click="deleteContact"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li>
        </ul>
    </div>

    <div id="contextMenu" class="context-menu" style="display: none"> 
        <ul class="menu">
            <li class="copy"><a href="javascript:void(0)" v-on:click="copyMessage"><i class="fa fa-copy" aria-hidden="true"></i> Copy</a></li>
        </ul>
    </div>
</template>

<script>
    import axios from "axios"
    import swal from "sweetalert2"
    import store from "../vuex/store"

    import "../../public/assets/css/chat.css"
    
    export default {

        data() {
            return {
                _id: "",
                name: "",
                message: "",
                page: 0,
                receiver: null,
                btnLoadMoreClass: "fa fa-repeat",
                hasMoreMessages: true,
                selectedMessageId: 0,
                selectedMessageText: "",
                password: "",
                searchContact: ""
            }
        },

        computed: {
            contacts() {
                return store.getters.getContacts
            },

            messages() {
                return store.getters.getMessages
            }
        },

        methods: {
            onSearchKeyPress: function () {
                if (event.key == "Enter") {
                    this.doSearchContact()
                }
            },

            onSearchKeyUp: function () {
                this.doSearchContact()
            },
            
            showContactOptions: function () {
                var menu = document.getElementById("contextMenuContactOptions")
                menu.style.display = 'block'
                menu.style.left = event.pageX + "px"
                menu.style.top = event.pageY + "px"
            },

            copyMessage: function() {
                navigator.clipboard.writeText(this.selectedMessageText)
            },

            showMoreOptions: function (msg) {
                const isMyMessage = event.target.getAttribute("is-my-message")
                this.selectedMessageId = msg._id
                this.selectedMessageText = msg.message
                
                var menu = document.getElementById("contextMenu")
                menu.style.display = 'block'
                if (isMyMessage == "true") {
                    menu.style.left = (event.pageX - 200) + "px"
                } else {
                    menu.style.left = event.pageX + "px"
                }
                menu.style.top = event.pageY + "px"

                document.querySelector(".bookmark i").className = "fa fa-bookmark-o"

                if (msg.bookmarkBy) {
                    document.querySelector(".bookmark i").className = "fa fa-bookmark"
                }
            },

            attachEventListeners: function() {
                const self = this

                document.addEventListener('click', function(e) {
                    const moreOptions = document.querySelectorAll(".more-options")
                    let isClickedMoreOptions = true
                    for (let a = 0; a < moreOptions.length; a++) {
                        if (moreOptions[a].contains(e.target)) {
                            // Clicked in box
                            isClickedMoreOptions = true
                            break
                        } else {
                            // Clicked outside the box
                            isClickedMoreOptions = false
                        }
                    }
                    if (!isClickedMoreOptions) {
                        document.getElementById("contextMenu").style.display = "none"
                        document.getElementById("contextMenuContactOptions").style.display = "none"
                    }
                })
            },

            getChatPersonPicture: function (user) {
                if (typeof user.picture !== "undefined" && user.picture != "") {
                    return this.$apiURL + "/" + user.picture
                }
                return "../../assets/img/avatar2.png"
            },

            getPicture: function (user) {
                if (typeof user.picture !== "undefined") {
                    return this.$apiURL + "/" + user.picture
                }
                return "../../assets/img/avatar7.png"
            },

            doSearchContact: async function () {
                const formData = new FormData()
                formData.append("searchContact", this.searchContact)
                
                const response = await axios.post(
                    this.$apiURL + "/contact/search",
                    formData,
                    {
                        headers: this.$headers
                    }
                )

                if (response.data.status == "success") {
                    store.commit("setContacts", response.data.data)
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            },

            doSearch: async function () {
                const form = event.target
                const formData = new FormData(form)
                formData.append("email", this.email)
                formData.append("password", this.password)
                
                const response = await axios.post(
                    this.$apiURL + "/chat/search",
                    formData,
                    {
                        headers: this.$headers
                    }
                )

                if (response.data.status == "success") {
                    store.commit("setMessages", [])
                    for (let a = 0; a < response.data.data.length; a++) {
                        store.commit("prependMessage", response.data.data[a])
                    }
                    this.attachEventListeners()
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            },

            getMessageTime: function (time) {
                const dateObj = new Date(time)
                let timeStr = dateObj.getDate() + " " + this.$months[dateObj.getMonth()] + ", " + dateObj.getFullYear() + " " + dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds()
                return timeStr
            },

            loadMore: function () {
                this.btnLoadMoreClass = "fa fa-spinner fa-spin"
                this.page++
                this.getData()
            },
            
            sendMessage: async function () {

                const formData = new FormData()
                formData.append("_id", this._id)
                formData.append("message", this.message)
                formData.append("password", this.password)

                const response = await axios.post(
                    this.$apiURL + "/chat/send",
                    formData,
                    {
                        headers: this.$headers
                    }
                )

                if (response.data.status == "success") {
                    this.message = ""

                    store.commit("appendMessage", response.data.messageObject)
                    this.attachEventListeners()
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            },

            deleteContact: async function () {
                const self = this

                swal.fire({
                    title: 'Are you sure?',
                    text: "This will be removed from your contact",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then(async function(result) {
                    if (result.isConfirmed) {

                        self.isDeleting = true;
                        const formData = new FormData()
                        formData.append("_id", self._id)

                        const response = await axios.post(
                            self.$apiURL + "/contact/delete",
                            formData,
                            {
                                headers: self.$headers
                            }
                        )
                        self.isDeleting = false

                        if (response.data.status == "success") {
                            swal.fire(
                                'Deleted!',
                                response.data.message,
                                'success'
                            );

                            const contactsArr = self.contacts;
                            for (let a = 0; a < contactsArr.length; a++) {
                                if (contactsArr[a]._id == self._id) {
                                    contactsArr.splice(a, 1);
                                    break;
                                }
                            }
                            self.contacts = contactsArr

                            store.commit("setMessages", [])
                            self.totalMessages = 0
                            self.name = ""
                            self._id = ""
                        } else {
                            swal.fire("Error", response.data.message, "error");
                        }
                    }
                })
            },

            onChatSelected: function () {
                const self = this
                store.commit("setMessages", [])
                this._id = event.target.getAttribute("data-id")
                this.name = event.target.getAttribute("data-name")

                this.getChat()
            },

            getChat: async function () {
                const self = this
                
                const formData = new FormData()
                formData.append("_id", this._id)
                formData.append("page", this.page)
                formData.append("password", this.password)

                const response = await axios.post(
                    this.$apiURL + "/chat/fetch",
                    formData,
                    {
                        headers: this.$headers
                    }
                )

                this.btnLoadMoreClass = "fa fa-repeat"

                if (response.data.status == "success") {

                    this.totalMessages = response.data.totalMessages

                    for (let a = 0; a < response.data.messages.length; a++) {
                        store.commit("prependMessage", response.data.messages[a])
                    }
                    this.hasMoreMessages = (response.data.messages.length == 0) ? false : true
                    this.receiver = response.data.receiver
                    this.user = response.data.user
                    this.attachEventListeners()
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            },

            getData: async function () {
                const self = this

                const response = await axios.post(
                    this.$apiURL + "/contact/fetch",
                    null,
                    {
                        headers: this.$headers
                    }
                )

                if (response.data.status == "success") {
                    store.commit("setContacts", response.data.contacts)
                } else {
                    swal.fire("Error", response.data.message, "error");
                }
            }
        },

        mounted: function () {
            this.getData()
        },

        watch: {
            $route: function (to, from) {
                store.commit("setMessages", [])
                store.commit("setContacts", [])
                this._id = ""
                this.name = ""
                this.isArchive = false
            }
        }
    }
</script>

<style>
    #home-page {
            height: 100%;
            margin: 0;
            background: #7F7FD5;
           background: -webkit-linear-gradient(to right, #91EAE4, #86A8E7, #7F7FD5);
            background: linear-gradient(to right, #91EAE4, #86A8E7, #7F7FD5);
        }

        .chat{
            margin-top: auto;
            margin-bottom: auto;
        }
        .card{
            height: 500px;
            border-radius: 15px !important;
            background-color: rgba(0,0,0,0.4) !important;
        }
        .contacts_body{
            padding:  0.75rem 0 !important;
            overflow-y: auto;
            white-space: nowrap;
        }
        .msg_card_body{
            overflow-y: auto;
        }
        .card-header{
            border-radius: 15px 15px 0 0 !important;
            border-bottom: 0 !important;
        }
     .card-footer{
        border-radius: 0 0 15px 15px !important;
            border-top: 0 !important;
            background-color: transparent !important;
    }
        .container{
            align-content: center;
        }
        .search{
            border-radius: 15px 0 0 15px !important;
            background-color: rgba(0,0,0,0.3) !important;
            border:0 !important;
            color:white !important;
        }
        .search:focus{
             box-shadow:none !important;
           outline:0px !important;
        }
        .type_msg{
            background-color: rgba(0,0,0,0.3) !important;
            border:0 !important;
            color:white !important;
            height: 60px !important;
            overflow-y: auto;
        }
            .type_msg:focus{
             box-shadow:none !important;
           outline:0px !important;
        }
        .attach_btn{
    border-radius: 15px 0 0 15px !important;
    background-color: rgba(0,0,0,0.3) !important;
            border:0 !important;
            color: white !important;
            cursor: pointer;
        }
        .send_btn{
    border-radius: 0 15px 15px 0 !important;
    background-color: rgba(0,0,0,0.3) !important;
            border:0 !important;
            color: white !important;
            cursor: pointer;
        }
        .search_btn{
            border-radius: 0 15px 15px 0 !important;
            background-color: rgba(0,0,0,0.3) !important;
            border:0 !important;
            color: white !important;
            cursor: pointer;
        }
        .contacts{
            list-style: none;
            padding: 0;
        }
        .contacts li{
            width: 100% !important;
            padding: 5px 10px;
            margin-bottom: 15px !important;
        }
    .active{
            background-color: rgba(0,0,0,0.3);
    }
        .user_img{
            height: 70px;
            width: 70px;
            border:1.5px solid #f5f6fa;
        
        }
        .user_img_msg{
            height: 40px;
            width: 40px;
            border:1.5px solid #f5f6fa;
        
        }
    .img_cont{
            position: relative;
            height: 70px;
            width: 70px;
    }
    .img_cont_msg{
            height: 40px;
            width: 40px;
    }
    .online_icon{
        position: absolute;
        height: 15px;
        width:15px;
        background-color: #4cd137;
        border-radius: 50%;
        bottom: 0.2em;
        right: 0.4em;
        border:1.5px solid white;
    }
    .offline{
        background-color: #c23616 !important;
    }
    .user_info{
        margin-top: auto;
        margin-bottom: auto;
        margin-left: 15px;
    }
    .user_info span{
        font-size: 20px;
        color: white;
    }
    .user_info p{
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    }
    .video_cam{
        margin-left: 50px;
        margin-top: 5px;
    }
    .video_cam span{
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-right: 20px;
    }
    .msg_cotainer{
        margin-top: auto;
        margin-bottom: auto;
        margin-left: 10px;
        border-radius: 25px;
        background-color: #82ccdd;
        padding: 10px;
        position: relative;
    }
    .msg_cotainer_send{
        margin-top: auto;
        margin-bottom: auto;
        margin-right: 10px;
        border-radius: 25px;
        background-color: #78e08f;
        padding: 10px;
        position: relative;
    }
    .msg_time{
        /*position: absolute;
        left: 0;
        bottom: -15px;
        color: rgba(255,255,255,0.5);*/
        font-size: 10px;
        margin-bottom: 0px;
        margin-top: 10px;
    }
    .msg_time_send{
        position: absolute;
        right:0;
        bottom: -15px;
        color: rgba(255,255,255,0.5);
        font-size: 10px;
    }
    .msg_head{
        position: relative;
    }
    #action_menu_btn{
        position: absolute;
        right: 10px;
        top: 10px;
        color: white;
        cursor: pointer;
        font-size: 20px;
    }
    .action_menu{
        z-index: 1;
        position: absolute;
        padding: 15px 0;
        background-color: rgba(0,0,0,0.5);
        color: white;
        border-radius: 15px;
        top: 30px;
        right: 15px;
        display: none;
    }
    .action_menu ul{
        list-style: none;
        padding: 0;
    margin: 0;
    }
    .action_menu ul li{
        width: 100%;
        padding: 10px 15px;
        margin-bottom: 5px;
    }
    .action_menu ul li i{
        padding-right: 10px;
    
    }
    .action_menu ul li:hover{
        cursor: pointer;
        background-color: rgba(0,0,0,0.2);
    }
    @media(max-width: 576px){
    .contacts_card{
        margin-bottom: 15px !important;
    }
    }
</style>