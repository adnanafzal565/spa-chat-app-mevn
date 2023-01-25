<template>
  <app-header />
    <router-view />
  <app-footer />
</template>

<script>
import AppHeader from "./components/layouts/AppHeader.vue"
import AppFooter from "./components/layouts/AppFooter.vue"

// import "../public/assets/css/bootstrap.min.css"
import "../public/assets/bootstrap/bootstrap.min.css"
import "../public/assets/font-awesome/css/font-awesome.min.css"

// import "../public/assets/js/bootstrap.min.js"
import "../public/assets/bootstrap/bootstrap.min.js"

// include jquery
window.$ = window.jQuery = require("jquery")

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
  }
}
</script>

<style>
body {
  margin-top: 0px !important;
}
.text-right {
  text-align: right;
}
</style>
