<template>
    <footer style="padding: 25px;">
        <div class="container">
            <div class="row">
                <div class="col-md-12 text-center text-white">
                    Copyright {{ year }}
                </div>
            </div>
        </div>
    </footer>

    <div class="footer fixed-bottom" id="link-premium-version" style="display: none;">
        This is a free version. Please check all the features in <router-link style="color: greenyellow;" to="/premiumVersion">premium version</router-link>.
    </div>
</template>

<script>
    import { computed } from 'vue'

    export default {
        setup() {
            const year = computed(function () {
                return new Date().getFullYear();
            });
            return { year };
        },

        watch: {
            /*$route: function (to, from) {
                if (to.path == "/premiumVersion") {
                    document.getElementById("link-premium-version").style.display = "none"
                } else {
                    document.getElementById("link-premium-version").style.display = ""
                }
            }*/
        }
    }
</script>

<style>
    #link-premium-version {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: lightseagreen;
        color: white;
        text-align: center;
        padding: 25px;
        font-size: 20px;
    }
    #link-premium-version a:hover {
        text-decoration: underline;
        cursor: pointer;
    }
</style>