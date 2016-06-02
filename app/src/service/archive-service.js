import Vue from 'vue';
var baseUrl = '/async';
export default {
    getArchiveOverview() {
        return Vue.http.get(baseUrl + '/archives.json')
            .then((res) => {
                if (res.ok) {
                    return res.data;
                }
            });
    },
    getArchives(year, month) {
        return Vue.http.get(baseUrl + '/archives/' + year + '/' + month + '/list.json')
            .then((res) => {
                if (res.ok) {
                    return res.data;
                }
            });
    }
};
