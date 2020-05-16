import Vue from 'vue';
import axios from 'axios';

axios.defaults.headers.common.Accept = 'application/json';

Vue.prototype.$axios = axios;
