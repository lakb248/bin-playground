<template>
    <div class="section">
        <post v-bind:post="post"></post>
    </div>
</template>
<script>
    import postService from '../service/post-service.js';
    import post from '../components/post.vue';
    export default {
        components: {
            'post': post
        },
        data() {
            return {
                post: {}
            };
        },
        route: {
            data(transition) {
                console.log(transition.to.params.path);
                return postService.getPost(transition.to.params.path)
                    .then(function (post) {
                        return {
                            post: post
                        };
                    });
            }
        }
    }
</script>
