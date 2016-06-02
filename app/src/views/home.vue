<template>
    <div class="section">
        <ul id="tag-list">
            <li v-for="tag in tags">
                <tag v-bind:tag="tag"></tag>
            </li>
        </ul>
        <post-list></post-list>
    </div>
</template>
<script>
    import postService from '../service/post-service.js';
    import tagService from '../service/tag-service.js';
    import postList from '../components/post-list.vue';
    import tag from '../components/tag.vue';

    export default {
        components: {
            'post-list': postList,
            'tag': tag
        },
        data() {
            return {
                tags: []
            }
        },
        route: {
            data() {
                return tagService.getTags()
                    .then(tags => {
                        return {
                            tags: tags
                        };
                    });
            }
        }
    };
</script>
<style lang="sass" scoped>
    #tag-list {
        width: 80%;
        margin-left: 10%;
        padding: 10px;
        overflow: hidden;
        li {
            float: left;
            margin: 0px;
            padding: 0px;
            margin-right: 20px;
            margin-bottom: 10px;
        }
    }
</style>
