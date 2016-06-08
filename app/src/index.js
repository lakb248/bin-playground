require('./styles/index.scss');
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

import Home from './views/home.vue';

Vue.use(VueResource);
Vue.use(VueRouter);

Vue.filter('timeStampFilter', function (input) {
    if (input) {
        return new Date(input).toLocaleString();
    } else {
        return '';
    }
});

var router = new VueRouter({
    hashbang: false,
    history: false
});

var App = Vue.extend({
    data() {
        return {
            isHeaderShow: true
        }
    },
    methods: {
        go(route) {
            this.$router.go(route);
        }
    }
});

router.map({
    '/': {
        name: 'home',
        component: Home
    },
    '/archive': {
        name: 'archive',
        component: (resolve) => {
            require(['./views/archive.vue'], resolve);
        }
    },
    '/tags': {
        name: 'tags',
        component: (resolve) => {
            require(['./views/tags.vue'], resolve);
        }
    },
    '/tags/:name': {
        name: 'tag',
        component: (resolve) => {
            require(['./views/tag.vue'], resolve);
        }
    },
    '/about': {
        name: 'about',
        component: (resolve) => {
            require(['./views/about.vue'], resolve);
        }
    },
    '/blog/*path': {
        name: 'blog',
        component: (resolve) => {
            require(['./views/blog.vue'], resolve);
        }
    }
});

router.redirect({
    '*': '/'
});

router.start(App, document.body, function () {
    // router.app.isDebug = Vue.config.debug;
    var lastScrollTop = document.body.scrollTop;
    var scrollTimeout = -1;
    window.addEventListener('scroll', function (e) {
        if (scrollTimeout !== -1) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function () {
            var currentScrollTop =  document.body.scrollTop;
            if (currentScrollTop > 120) {
                if (currentScrollTop - lastScrollTop > 0) {
                    router.app.isHeaderShow = false;
                } else {
                    router.app.isHeaderShow = true;
                }
                lastScrollTop = currentScrollTop;
            } else {
                router.app.isHeaderShow = true;
            }
        }, 50);
    });
});
