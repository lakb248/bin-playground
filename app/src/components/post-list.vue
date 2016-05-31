<template>
    <ul>
        <li v-for="post in posts">
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
            postService.getPosts()
                .then(function (data) {
                    self.posts = data.posts
                }, function (error) {
                    console.log(error);
                });

        }
    }
</script>
<style lang="sass" scoped>
    li {
        margin-bottom: 20px;
    }
</style>
