<template>
    <div class="section">
        <ul id="archive-container">
            <li v-for="archives in archivesList" transition="fade">
                <div class="archive-date">
                    <div class="archive-year">
                        {{archives.year}}
                    </div>
                    <div class="archive-month">
                        {{archives.month}}月
                    </div>
                </div>
                <div class="archive-list">
                    <ul>
                        <li v-for="post in archives.posts">
                            <post :post="post" overview="1"></post>
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
        padding-left: 0px;
        & > li {
            width: 100%;
            border-left: 100px solid transparent;
            margin-bottom: 50px;
        }
    }
    .archive-date {
        float: left;
        width: 100px;
        margin-left: -100px;
        padding-top: 20px;
        font-size: 24px;
        text-align: center;
    }
    .archive-year {
        color: #C6CBCC;
        font-size: 32px;
    }
    .archive-month {
        color: #C6CBCC;
        font-size: 24px;
    }
    .archive-list ul {
        padding-left: 0px;
    }
    .fade-transition {
        transition: all 1s;
    }
    .fade-enter, .fade-leave {
        margin-left: -50%;
        opacity: 0;
    }
    @media (max-width: 500px) {
        #archive-container > li {
            border: none;
        }
        .archive-date {
            float: none;
            margin-left: 0px;
        }
    }
</style>
