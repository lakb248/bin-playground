<template>
    <div class="section">
        <ul id="tags-container">
            <li v-for="tag in tagsList" transition="fade">
                <div class="tag-title">
                    <tag :tag="tag"></tag>
                </div>
                <div class="post-list">
                    <ul>
                        <li v-for="post in tag.posts">
                            <post :post="post" overview="1"></post>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    import tagService from '../service/tag-service.js';
    import postService from '../service/post-service.js';
    import post from '../components/post.vue';
    import tag from '../components/tag.vue';
    export default {
        data() {
            return {
                tagsList: []
            };
        },
        components: {
            'post': post,
            'tag': tag
        },
        ready() {
            var self = this;
            tagService.getTags()
                .then((overview) => {
                    var lastTags = null;
                    for (let i = overview.length - 1; i >= 0; i --) {
                        let temp = overview[i];
                        if (lastTags == null) {
                            lastTags = postService.getPostByTag(temp.name)
                                            .then((posts) => {
                                                self.tagsList.push(posts);
                                            });
                        } else {
                            lastTags = lastTags.then(() => {
                                return postService.getPostByTag(temp.name)
                                    .then((posts) => {
                                        self.tagsList.push(posts);
                                    });
                            });
                        }
                    }
                });
        }
    };
</script>
<style lang="sass">
    #tags-container {
        width: 100%;
        padding-left: 0px;
        & > li {
            width: 100%;
            border-left: 100px solid transparent;
            margin-bottom: 50px;
        }
    }
    .post-list ul {
        padding-left: 0px;
    }
    .tag-title {
        float: left;
        margin-left: -100px;
        padding-top: 20px;
        font-size: 24px;
        text-align: center;
    }
    .fade-transition {
        transition: all 1s;
    }
    .fade-enter, .fade-leave {
        margin-left: -50%;
        opacity: 0;
    }
    @media (max-width: 550px) {
        #tags-container > li {
            border: none;
        }
        .tag-title {
            float: none;
            display: inline-block;
            margin-left: 0px;
            padding-left: 20px;
        }
    }
</style>
