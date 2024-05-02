<script setup lang="ts">
import { RoutePath } from '~/options/routes'
</script>

<template>
  The Reddit API
  <a class="underline" href="https://www.reddit.com/r/TheoryOfReddit/comments/rfo7bt/comment/hoiqtpy/">
    does not allow you to fetch more than 1,000 items</a>, and it also does not provide information about upvoted comments. However, if you need them, you can get your data
  from <a class="underline" href="https://www.reddit.com/settings/data-request">reddit.com/settings/data-request</a>.
  Submit a request there with "I want data from my full time at Reddit" option and wait untill Reddit sends you the data
  on your email. The data will be in the form of a ZIP archive containing various files. Once you have extracted the
  files, you can import them on the <router-link :to="RoutePath.Import">
    Import
  </router-link> page.
  <br>
  The extension supports following files:
  <div class="ml-4 grid grid-cols-[auto,1fr] gap-x-4">
    <b>saved_comments.csv</b>
    <span>should contain <i>id</i> and <i>permalink</i> columns</span>
    <b>saved_posts.csv</b>
    <span>should contain <i>id</i> and <i>permalink</i> columns</span>
    <b>comment_votes.csv</b>
    <span>should contain <i>id</i>, <i>permalink</i> and <i>direction</i> columns</span>
    <b>post_votes.csv</b>
    <span>should contain <i>id</i>, <i>permalink</i> and <i>direction</i> columns</span>
  </div>
</template>
