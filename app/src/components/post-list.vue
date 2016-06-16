<template>
    <ul>
        <li v-for="post in posts" transition="fade">
            <post v-bind:post="post"></post>
        </li>
    </ul>
</template>
<script>
    import post from './post.vue';
    import postService from '../service/post-service.js';
    export default {
        data() {
            return {
                posts: []
            }
        },
        components: {
            'post': post
        },
        ready() {
            var self = this;
            var totalPage = 1;
            var curPage = 1;
            var touchBottom = false;
            postService.getPosts()
                .then(function (data) {
                    self.posts = data.posts;
                    totalPage = data._totalPage;
                }, function (error) {
                    console.log(error);
                }).then(function () {
                    window.addEventListener('scroll', function () {
                        if (!touchBottom) {
                            var scrollHeight = document.body.scrollHeight;
                            var scrollTop = document.body.scrollTop;
                            var clientHeight = document.body.clientHeight;

                            if ((scrollHeight - scrollTop - clientHeight) < 5) {
                                console.log('bottom');
                                touchBottom = true;
                                if (curPage < totalPage) {
                                    curPage ++;
                                    postService.getPosts(curPage)
                                        .then(data => {
                                            var posts = data.posts;
                                            var length = posts.length;
                                            for (var i = 0; i < length; i ++) {
                                                self.posts.push(posts[i]);
                                            }
                                            touchBottom = false;
                                        }, error => {
                                            console.log(error);
                                        });
                                }
                            }
                        }
                    });
                });
        }
    }
</script>
<style lang="sass" scoped>
    ul {
        padding: 0px;
    }
    li {
        margin-bottom: 20px;
        width: 100%;
    }
    .fade-transition {
        transition: all 1s;
    }
    .fade-enter, .fade-leave {
        margin-left: -50%;
        opacity: 0;
    }
</style>
