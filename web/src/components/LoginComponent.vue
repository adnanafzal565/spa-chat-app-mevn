<template>
    <div class="container" style="margin-top: 50px;">
        <div class="row">
            <div class="col-md-12 text-center">
                <h1>Login</h1>
            </div>
        </div>

        <div class="row">
            <div class="offset-md-3 col-md-6">
                <form method="POST" v-on:submit.prevent="doLogin">
                    <div class="form-group">
                        <label>Enter email</label>
                        <input type="email" class="form-control" name="email" required />
                    </div>

                    <br />

                    <div class="form-group">
                        <label>Enter password</label>
                        <input type="password" class="form-control" name="password" required />
                    </div>

                    <br />

                    <input type="submit" v-bind:value="isLoading ? 'Loading...' : 'Login'" v-bind:disabled="isLoading" name="submit" class="btn btn-primary" />
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
            };
        },

        methods: {
            doLogin: async function () {
                const self = this
                const form = event.target
                const formData = new FormData(form)

                this.isLoading = true;

                const response = await axios.post(
                    this.$apiURL + "/login",
                    formData
                );

                if (response.data.status == "success") {
                    // get access token from server
                    var accessToken = response.data.accessToken;

                    // save in local storage
                    localStorage.setItem(this.$accessTokenKey, accessToken)

                    setTimeout(function () {
                        window.location.href = "/"
                    }, 500);

                    form.reset()
                } else {
                    this.isLoading = false;
                    swal.fire("Error", response.data.message, "error");
                }
            }
        }
    }
</script>