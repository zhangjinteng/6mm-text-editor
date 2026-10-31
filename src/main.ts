import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { installFonts } from './fonts';

installFonts(document);
createApp(App).mount('#app');
