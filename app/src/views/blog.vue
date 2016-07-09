<template>
    <div class="section">
        <post v-bind:post="post" overview="0"></post>
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
