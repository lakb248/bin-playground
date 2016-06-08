import Vue from 'vue';
var baseUrl = '/async';
// var baseUrl = '';
export default {
    getPosts(page) {
        page = (!page || page === 1) ? '' : ('-' + page);
        return Vue.http.get(baseUrl + '/lists/list' + page + '.json')
            .then((res) => {
                if (res.ok) {
                    return res.data;
                }
            });
    },
    getPost(path) {
        return Vue.http.get(baseUrl + '/posts/' + path.substring(0, path.length - 1) + '.json')
            .then((res) => {
                if (res.ok) {
                    return res.data;
                }
            });
    },
    getPostByTag(tag) {
        return Vue.http.get(baseUrl + '/tags/' + tag + '.json')
            .then((res) => {
                if (res.ok) {
                    return res.data;
                }
            });
    }
};
