<template>
    <div class="post-item">
        <div class="post-title">
            <a v-link="{path: '/blog' + post.permalink}">
                {{post.title}}
            </a>
        </div>
        <ul class="post-tags">
            <li v-for="tag in post.tags">
                <tag v-bind:tag="tag"></tag>
            </li>
        </ul>
        <div class="post-date">
            {{post.date | timeStampFilter}}
        </div>
        <div class="post-content">
            {{{post.content}}}
        </div>
    </div>
</template>
<script>
    import tag from './tag.vue';
    export default {
        components: {
            tag: tag
        },
        props: ['post']
    }
</script>
<style lang="sass" scoped>
    $font-color: #232B2D;
    .post-item {
        width: 100%;
        padding: 20px;
        box-shadow: 1px 2px 1px 0px rgba(204,204,204,0.5);
        &:hover {
            box-shadow: 2px 4px 3px 0px rgba(176,176,176,0.5);
        }
    }
    .post-title {
        float: left;
        line-height: 30px;
        margin-right: 20px;
        a {
            color: $font-color;
        }
    }
    .post-date {
        font-size: 12px;
        margin-top: 10px;
        clear: both;
    }
    .post-tags {
        float: left;
        height: 18px;
        margin: 0px;
        padding: 0px;
        margin-bottom: 20px;
        margin-top: 6px;
        li {
            float: left;

        }
    }
    .post-content {
        font-size: 14px;
        margin-top: 10px;
    }
</style>
