<template>
    <div class="section">
        <ul>
            <li v-for="post in posts">
                <post :post="post"></post>
            </li>
        </ul>
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
                posts: []
            }
        },
        route: {
            data(transition) {
                console.log(transition);
                var tag = transition.to.params.name;
                return postService.getPostByTag(tag)
                    .then((data) => {
                        console.log(data);
                        return {
                            posts: data.posts
                        };
                    });
            }
        }
    };
</script>
