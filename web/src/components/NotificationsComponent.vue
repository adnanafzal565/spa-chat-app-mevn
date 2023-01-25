<template>
	<div class="container" style="margin-top: 50px;">
		<!-- heading -->
		<div class="row">
	        <div class="col-md-12">
	            <h1 class="text-center">Notifications</h1>
	        </div>
	    </div>
	    
		<div class="row">
			<div class="col-md-12">
				<!-- show all notifications -->
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Type</th>
							<th>Actions</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="notification in notifications" v-bind:key="notification._id">
							<!-- show type of notification -->
							<td>
								<span v-text="notification.type"></span>&nbsp;

								<!-- if type is group invite, then we also show the name of group -->
								<template v-if="notification.type == 'group_invite'">
									<span v-text="notification.group.name"></span>
								</template>
							</td>

							<!-- a button to delete the notification -->
							<td style="display: flex;">
								<form v-on:submit.prevent="deleteNotification">
									<input type="hidden" name="_id" v-bind:value="notification._id" required />
									<input type="submit" v-bind:value="isDeleting ? 'Deleting...' : 'Delete'" v-bind:isDeleting="disabled" class="btn btn-danger" />
								</form>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>

	import axios from "axios"
	import swal from "sweetalert2"
	import store from "../vuex/store"

	export default {

		date() {
			return {
				isDeleting: false
			}
		},

		methods: {
			// method to mark all notifications as read
			markAsRead: async function () {
				const response = await axios.post(
					this.$apiURL + "/markNotificationsAsRead",
					null,
					{
						headers: this.$headers
					}
				)

				if (response.data.status == "success") {
					// update in local array
					const tempNotifications = store.getters.getNotifications
					for (let a = 0; a < tempNotifications.length; a++) {
						tempNotifications[a].isRead = true
					}
					store.commit("setNotifications", tempNotifications)

					// set the unread notifications to zero
					store.commit("setUnreadNotifications", 0)
				}
			},

			// method to delete the notification
			deleteNotification: async function () {
				const form = event.target
				const _id = form._id.value
				const formData = new FormData(form)

				this.isDeleting = true

				const response = await axios.post(
					this.$apiURL + "/deleteNotification",
					formData,
					{
						headers: this.$headers
					}
				)
				this.isDeleting = false

				if (response.data.status == "success") {
					// remove from local array
					const tempNotifications = store.getters.getNotifications
					for (let a = 0; a < tempNotifications.length; a++) {
						if (tempNotifications[a]._id == _id) {
							tempNotifications.splice(a, 1)
							break
						}
					}
					store.commit("setNotifications", tempNotifications)
				} else {
					swal.fire("Error", response.data.message, "error");
				}
			},
		},

		// on page loaded, mark all notifications as read
		mounted: function () {
			this.markAsRead()
		},

		// create computed property for all notifications
	    computed: {
			notifications() {
				return store.getters.getNotifications.reverse()
			}
		}
	}
</script>