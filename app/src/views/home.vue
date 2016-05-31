<template>
    <div class="section">
        <post-list></post-list>
    </div>
</template>
<script>
    import postService from '../service/post-service.js';
    import postList from '../components/post-list.vue';

    export default {
        components: {
            'post-list': postList
        }
    };
</script>
<style lang="sass" scoped>
    li {
        margin-bottom: 20px;
    }
</style>
