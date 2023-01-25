<template>
	<div class="container" style="margin-top: 50px;">
		<div class="row">
            <div class="col-md-12">
                <h1 class="text-center">Add Contact</h1>
            </div>
        </div>

		<div class="row">
			<div class="offset-md-3 col-md-6">
				<form method="POST" v-on:submit.prevent="addContact">
					<div class="form-group">
						<label>Name</label>
						<input type="text" name="name" class="form-control" required />
					</div>

					<div class="form-group" style="margin-top: 20px; margin-bottom: 30px;">
						<label>E-mail</label>
						<input type="email" name="email" class="form-control" required />
					</div>

					<div class="d-grid gap-2">
						<input type="submit" class="btn btn-primary btn-block" v-bind:value="isLoading ? 'Adding...' : 'Add Contact'" v-bind:disabled="isLoading" />
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
	import axios from "axios"
	import swal from "sweetalert2"

	export default {
		data() {
			return {
				"isLoading": false
			}
		},

		methods: {
			addContact: async function () {
				const form = event.target;
				const formData = new FormData(form);

				this.isLoading = true;
				const response = await axios.post(
					this.$apiURL + "/contact/save",
					formData,
					{
						headers: this.$headers
					}
				);
				
				this.isLoading = false;
				swal.fire("Add Contact", response.data.message, response.data.status);

				if (response.data.status == "success") {
					form.reset()
				}
			}
		},
	}
</script>