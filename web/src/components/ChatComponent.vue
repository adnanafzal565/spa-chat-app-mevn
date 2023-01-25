<template>
	<div class="container">
		<div class="row clearfix">
			<div class="col-lg-12">

				<div class="card" v-if="isArchive">
					<div class="card-body">
						<h2 class="text-center" style="margin-top: 20px;">This chat has been archived</h2>

						<div class="row" style="margin-top: 100px; margin-bottom: 100px;">
							<div class="offset-md-4 col-md-4">
								<form v-on:submit.prevent="verifyArchivedPassword">
									<div class="form-group" style="margin-bottom: 10px;">
										<label>Enter password</label>
										<input type="password" name="password" class="form-control" required style="margin-top: 10px;" />
									</div>

									<input type="submit" class="btn btn-danger" value="Open chat" />
								</form>
							</div>
						</div>
					</div>
				</div>

				<div class="card chat-app" v-if="!isArchive">
					<div class="chat">
						<div class="chat-header clearfix">
							<div class="row">
								<div class="col-lg-6">
									<a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
										<img v-if="receiver != null" v-bind:src="getChatPersonPicture(receiver)" alt="avatar" style="width: 50px;" />
									</a>

									<div class="chat-about">
										<h6 class="m-b-0 text-white" v-if="receiver != null" v-text="receiver.name" style="margin-bottom: 0px; position: relative; top: 10px;"></h6>
									</div>
								</div>

								<div class="col-lg-6 hidden-sm text-right text-white">

									<button type="button" class="btn btn-primary" style="margin-right: 10px;" v-on:click="showBookmarkedMessages" v-text="isShowingBookmarked ? 'All messages' : 'Bookmarked messages'"></button>

									<form style="display: inline-block;" v-on:submit.prevent="doSearch">
										<div class="form-group" style="display: flex;">
											<input type="search" name="search" autocomplete="off" />
											<button type="submit" class="btn btn-link">
												<i class="fa fa-search"></i>
											</button>
										</div>
									</form>

									<span v-if="attachment != null" style="margin-right: 10px; position: relative; top: 7px;" v-text="attachment.name"></span>
									<a href="javascript:void(0);" class="btn btn-outline-secondary pull-right text-white" v-on:click="selectFile"><i class="fa fa-paperclip"></i></a>
									<input type="file" id="attachment" style="display: none;" v-on:change="fileSelected" />
								</div>
							</div>
						</div>

						<div class="chat-history">
							<ul class="m-b-0">
								<li style="text-align: center;">
									<i v-bind:class="btnLoadMoreClass + ' btnLoadMore'" v-on:click="loadMore" v-if="hasMoreMessages"></i>
								</li>

								<li v-for="msg in messages" class="clearfix" v-bind:key="msg._id">
									<div class="more-options" v-on:click="showMoreOptions(msg)" v-bind:is-my-message="(user != null && user.email == msg.sender.email)" v-bind:style="(user != null && user.email == msg.sender.email) ? { 'float': 'right' } : { 'position': 'relative', 'top': '15px' }"></div>

									<div v-bind:class="'message ' + (user != null && user.email == msg.sender.email ? 'my-message float-right' : 'other-message')">
										<p v-text="msg.message" v-bind:class="(user != null && user.email == msg.sender.email ? 'text-right' : '')" style="margin-bottom: 0px;"></p>

										<template v-if="msg.attachment != null">
										    <a href="javascript:void(0)" v-bind:data-id="msg._id" v-on:click.prevent="downloadAttachment" v-text="msg.attachment.displayName" class="text-info" target="_blank"></a>
										</template>
									</div>

									<div v-bind:class="'message-data ' + (user != null && user.email == msg.sender.email ? 'float-right' : '')">
										<span class="message-data-time text-white" v-text="getMessageTime(msg.createdAt)" style="margin-right: 10px;"></span>
										<img v-bind:src="getPicture(msg.sender)" alt="avatar" style="width: 100px;" />
									</div>
								</li>
							</ul>
						</div>

						<div class="chat-message clearfix">
							<div class="input-group mb-0">
								<div class="input-group mb-3">
									<input type="text" class="form-control send-message" placeholder="Enter text here..." v-model="message" />

									<button class="btn btn-primary" v-on:click="sendMessage" type="button">Send</button>
								</div>
							</div>

							<div id="emojis"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<a v-bind:href="base64Str" ref="btnDownloadAttachment" v-bind:download="downloadFileName"></a>

	<div id="contextMenu" class="context-menu" style="display: none"> 
        <ul class="menu"> 
            <li class="copy"><a href="javascript:void(0)" v-on:click="copyMessage"><i class="fa fa-copy" aria-hidden="true"></i> Copy</a></li>

            <li class="bookmark"><a href="javascript:void(0)" v-on:click="bookmarkMessage"><i class="fa fa-bookmark-o" aria-hidden="true"></i> Bookmark</a></li>
        </ul> 
    </div>
</template>

<script>

	import "../../public/assets/css/chat.css"
	import "../../public/assets/emoji/emojis.css"
	import "../../public/assets/emoji/DisMojiPicker.js"
	
	import axios from "axios"
	import swal from "sweetalert2"
	import store from "../vuex/store"

	export default {
		data() {
			return {
				attachment: null,
				message: "",
				email: this.$route.params.email,
				page: 0,
				receiver: null,
				base64Str: "",
				downloadFileName: "",
				btnLoadMoreClass: "fa fa-repeat",
				hasMoreMessages: true,
				selectedMessageId: 0,
				selectedMessageText: "",
				isShowingBookmarked: false,
				isArchive: false,
				password: ""
			}
		},

		computed: {
		    messages() {
		        return store.getters.getMessages
		    }
		},

		methods: {

			verifyArchivedPassword: async function () {
				const self = this
				const form = event.target
				const formData = new FormData(form)
				formData.append("email", this.email)
			    
			    const response = await axios.post(
			        this.$apiURL + "/chat/verifyArchivedPassword",
			        formData,
			        {
			            headers: this.$headers
			        }
			    )

			    if (response.data.status == "success") {
			    	this.isArchive = response.data.isArchive
			    	this.password = form.password.value

			    	if (this.isArchive) {
			    		store.commit("setMessages", [])
				    	this.getData()

				    	setTimeout(function () {
				    		self.initializeEmoji()
				    	}, 500)
				    }
			    } else {
			        swal.fire("Error", response.data.message, "error")
			    }
			},

			showBookmarkedMessages: async function () {
				store.commit("setMessages", [])

				if (this.isShowingBookmarked) {
					this.page = 0
					this.getData()
					this.isShowingBookmarked = false
				} else {
					const formData = new FormData()
					formData.append("email", this.email)
					formData.append("password", this.password)
				    
				    const response = await axios.post(
				        this.$apiURL + "/chat/getBookmarked",
				        formData,
				        {
				            headers: this.$headers
				        }
				    )

				    if (response.data.status == "success") {
				    	for (let a = 0; a < response.data.data.length; a++) {
							store.commit("prependMessage", response.data.data[a])
						}
						this.attachEventListeners()
				    } else {
				        swal.fire("Error", response.data.message, "error")
				    }

				    this.isShowingBookmarked = true
				}
			},

			copyMessage: function() {
				navigator.clipboard.writeText(this.selectedMessageText)
			},

			bookmarkMessage: async function() {
				const target = event.target
				const formData = new FormData()
				formData.append("_id", this.selectedMessageId)
				formData.append("password", this.password)
			    
			    const response = await axios.post(
			        this.$apiURL + "/chat/bookmark",
			        formData,
			        {
			            headers: this.$headers
			        }
			    )

			    if (response.data.status == "success") {
			    	for (let a = 0; a < this.messages.length; a++) {
			    		if (this.messages[a]._id == this.selectedMessageId) {
			    			this.messages[a] = response.data.newMessage
			    			break
			    		}
			    	}
			    	store.commit("setMessages", this.messages)
			    } else {
			        swal.fire("Error", response.data.message, "error")
			    }
			},

			hideMoreOptions: function () {
				document.getElementById("contextMenu").style.display = "none"
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
						self.hideMoreOptions()
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

			downloadAttachment: async function () {
			    const anchor = event.target
			    const id = anchor.getAttribute("data-id")
			    const originalHtml = anchor.innerHTML
			    anchor.innerHTML = "Loading..."

			    const formData = new FormData()
			    formData.append("messageId", id)
			    formData.append("password", this.password)
			    
			    const response = await axios.post(
			        this.$apiURL + "/chat/attachment",
			        formData,
			        {
			            headers: this.$headers
			        }
			    )

			    if (response.data.status == "success") {
			        this.base64Str = response.data.base64Str
			        this.downloadFileName = response.data.fileName
			        
			        const btnDownloadAttachment = this.$refs["btnDownloadAttachment"]
			        setTimeout(function () {
			            btnDownloadAttachment.click()
			            anchor.innerHTML = originalHtml
			        }, 500)
			    } else {
			        swal.fire("Error", response.data.message, "error")
			    }
			},

			fileSelected: function () {
				const files = event.target.files
				if (files.length > 0) {
					this.attachment = files[0]
				}
			},

			selectFile: function () {
				document.getElementById("attachment").click()
			},

			getMessageTime: function (time) {
				const dateObj = new Date(time)
				let timeStr = dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + " " + dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds()
				return timeStr
			},

			loadMore: function () {
				this.btnLoadMoreClass = "fa fa-spinner fa-spin"
				this.page++
				this.getData()
			},

			getData: async function () {
				if (this.email == null) {
					return
				}

				const formData = new FormData()
				formData.append("email", this.email)
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
					
					for (let a = 0; a < response.data.messages.length; a++) {
						store.commit("prependMessage", response.data.messages[a])
					}
					this.hasMoreMessages = (response.data.messages.length == 0) ? false : true
					this.receiver = response.data.receiver
					this.user = response.data.user
					this.isArchive = response.data.isArchive
					this.attachEventListeners()
				} else {
					swal.fire("Error", response.data.message, "error")
				}
			},

			sendMessage: async function () {

				const formData = new FormData()
				formData.append("email", this.email)
				formData.append("message", this.message)
				formData.append("password", this.password)
				if (this.attachment != null) {
					formData.append("attachment", this.attachment)
				}

				const response = await axios.post(
					this.$apiURL + "/chat/send",
					formData,
					{
						headers: this.$headers
					}
				)

				if (response.data.status == "success") {
					this.message = ""

					this.attachment = null
					document.getElementById("attachment").value = null

					store.commit("appendMessage", response.data.messageObject)
					this.attachEventListeners()
				} else {
					swal.fire("Error", response.data.message, "error")
				}
			},

			initializeEmoji: function() {
				const self = this
				$("#emojis").disMojiPicker()
				twemoji.parse(document.body)
				$("#emojis").picker(function (emoji) {
					self.message += emoji
				})
			}
		},

		mounted() {
			this.getData()
			this.initializeEmoji()

			/*document.addEventListener("click", function () {
				self.hideMoreOptions()
			})

       		document.oncontextmenu = function () {
       			event.preventDefault()

	            if (document.getElementById("contextMenu").style.display == "block"){ 
	                hideMenu(); 
	            }else{ 
	                var menu = document.getElementById("contextMenu")      
	                menu.style.display = 'block'; 
	                menu.style.left = event.pageX + "px"; 
	                menu.style.top = event.pageY + "px"; 
	            }
       		}*/
		},

		watch: {
            $route: function (to, from) {
                if (from.href.includes("/chat/")) {
                	store.commit("setMessages", [])
                }
            }
        },
	}
</script>