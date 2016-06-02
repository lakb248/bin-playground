<template>
    <div class="section">
        <ul id="archive-container">
            <li v-for="archives in archivesList">
                <div class="archive-date">
                    {{archives.year}}-{{archives.month}}
                </div>
                <div class="archive-list">
                    <ul>
                        <li v-for="post in archives.posts">
                            <post :post="post"></post>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    import archiveService from '../service/archive-service.js';
    import post from '../components/post.vue';
    export default {
        data() {
            return {
                archivesList: []
            };
        },
        components: {
            'post': post
        },
        ready() {
            var self = this;
            archiveService.getArchiveOverview()
                .then((overview) => {
                    var lastArchives = null;
                    for (let i = overview.length - 1; i >= 0; i --) {
                        let temp = overview[i];
                        if (lastArchives == null) {
                            lastArchives = archiveService.getArchives(temp.year, temp.month)
                                            .then((archives) => {
                                                self.archivesList.push(archives);
                                            });
                        } else {
                            lastArchives = lastArchives.then(() => {
                                return archiveService.getArchives(temp.year, temp.month)
                                    .then((archives) => {
                                        self.archivesList.push(archives);
                                    })
                            });
                        }
                    }
                });
        }
    };
</script>
<style lang="sass">
    #archive-container {
        width: 100%;
        & > li {
            width: 100%;
            border-left: 100px solid transparent;
        }
    }
    .archive-date {
        float: left;
        width: 100px;
        margin-left: -100px;
        padding-top: 20px;
        font-size: 24px;
    }
    .archive-list {

    }
</style>
