<template>
	<div class="container" style="margin-top: 50px;">
		<div class="row">
			<div class="col-md-12">
				<h1 class="text-center">Premium version</h1>
			</div>
		</div>

		<div class="card-deck mb-3 text-center" style="margin-top: 50px;">
        
			<div class="card mb-4 box-shadow">
				<div class="card-header">
					<h4 class="my-0 font-weight-normal">Free</h4>
				</div>
				
				<div class="card-body">
					<h1 class="card-title pricing-card-title">$0</h1>
					<ul class="list-unstyled mt-3 mb-4">
						<li>Sign up</li>
						<li>Login/logout</li>
						<li>Add contacts</li>
						<li>Private chat</li>
						<li>End-to-end encryption</li>
						<li>Chat with attachment</li>
						<li>Realtime chat</li>

						<li><del>Email verification</del></li>
						<li><del>Reset password</del></li>
						<li><del>User profile</del></li>
						<li><del>Chat with emojis</del></li>
						<li><del>Bookmark messages</del></li>
						<li><del>Copy message</del></li>
						<li><del>Archive chat with password</del></li>
						<li><del>Create groups</del></li>
						<li><del>Join groups</del></li>
						<li><del>Add members</del></li>
						<li><del>Change group admin</del></li>
						<li><del>Group chat with attachment</del></li>
						<li><del>Notifications page</del></li>
						<li><del>Un-read group messages counter</del></li>
						<li><del>Customer support</del></li>
					</ul>
				</div>
			</div>

			<div class="card mb-4 box-shadow">
				<div class="card-header">
					<h4 class="my-0 font-weight-normal">Premium</h4>
				</div>
				
				<div class="card-body">
					<h1 class="card-title pricing-card-title">$20</h1>
					<ul class="list-unstyled mt-3 mb-4">
						<li>Sign up</li>
						<li>Login/logout</li>
						<li>Add contacts</li>
						<li>Private chat</li>
						<li>End-to-end encryption</li>
						<li>Chat with attachment</li>
						<li>Realtime chat</li>

						<li>
							<a href="javascript:void(0)" v-on:click="onDemoClicked" v-bind:data-title="'Email verification'" v-bind:data-url="'https://www.youtube.com/embed/nNmMbqcrmig'">
								Email verification
							</a>
						</li>
						
						<li>Reset password</li>
						<li>User profile</li>

						<li>
							<a href="javascript:void(0)" v-on:click="onDemoClicked" v-bind:data-title="'Chat with emojis'" v-bind:data-url="'https://www.youtube.com/embed/vJ9yIB5_oUM'">
								Chat with emojis
							</a>
						</li>
						
						<li>Bookmark messages</li>
						<li>Copy message</li>

						<li>
							<a href="javascript:void(0)" v-on:click="onDemoClicked" v-bind:data-title="'Archive chat with password'" v-bind:data-url="'https://www.youtube.com/embed/yzwx3baxJbk'">
								Archive chat with password
							</a>
						</li>
						
						<li>Create groups</li>
						<li>Join groups</li>
						<li>Add members</li>
						<li>Change group admin</li>

						<li>
							<a href="javascript:void(0)" v-on:click="onDemoClicked" v-bind:data-title="'Group chat with attachment'" v-bind:data-url="'https://www.youtube.com/embed/2rNansRUtf8'">
								Group chat with attachment
							</a>
						</li>

						<li>Notifications page</li>
						<li>Un-read group messages counter</li>
						<li>Customer support</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-md-12">
				<p class="text-center">Contact us to buy:<br />support@adnan-tech.com</p>
			</div>
		</div>
	</div>

	<div class="modal" id="demoModal">
		<div class="modal-dialog modal-dialog-centered modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title"></h5>
					
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>

				<div class="modal-body">
					<iframe width="720" height="400" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: relative; transform: translateX(-50%); left: 50%;"></iframe>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		methods: {
			onDemoClicked: function() {
				const self = event.target
			    
			    const url = self.getAttribute("data-url")
			    const title = self.getAttribute("data-title")

			    document.querySelector("#demoModal .modal-title").innerHTML = title
			    document.querySelector("#demoModal .modal-body iframe").setAttribute("src", url)

			    $("#demoModal").modal("show")
			}
		},

		mounted: function () {
			const script = document.createElement("script")
			script.src = "https://code.tidio.co/kapdevnmnkvcubnn6z7zpiatypsbunjr.js"
			script.setAttribute("async", "async")
			document.body.appendChild(script)
		}
	}
</script>

<style scoped>
	.pricing-header {
	  max-width: 700px;
	}

	.card {
		background-color: white !important;
		height: auto !important;
	}

	.card-deck .card {
	  min-width: 220px;
	}

	.border-top { border-top: 1px solid #e5e5e5; }
	.border-bottom { border-bottom: 1px solid #e5e5e5; }

	.box-shadow { box-shadow: 0 .25rem .75rem rgba(0, 0, 0, .05); }
</style>