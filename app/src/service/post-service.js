import Vue from 'vue';
var baseUrl = '/async';
export default {
    getPosts(page) {
        page = (!page || page === 1) ? '' : ('-' + page);
        return Vue.http.get(baseUrl + '/lists/list' + page + '.json')
            .then(function (res) {
                if (res.ok) {
                    return res.data;
                }
            });
    },
    getPost(path) {
        return Vue.http.get(baseUrl + '/posts/' + path.substring(0, path.length - 1) + '.json')
            .then(function (res) {
                if (res.ok) {
                    return res.data;
                }
            });
    }
};
