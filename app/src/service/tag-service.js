import Vue from 'vue';
export default {
    getTags() {
        return Vue.http.get('/async/tags.json')
            .then(res => {
                if (res.ok) {
                    return res.data;
                }
            });
    }
};
